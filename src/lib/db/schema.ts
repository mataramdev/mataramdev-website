import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "contributor"]);

/**
 * Status persetujuan pendaftaran.
 *
 * Akun baru masuk sebagai `pending` (lihat `approval.sql` + handle_new_user) dan
 * TIDAK bisa login sampai admin menyetujuinya lewat /admin/users. Ini terpisah
 * dari `is_active`: `pending` = belum pernah disetujui, sedangkan `is_active`
 * false = sengaja dinonaktifkan admin setelah disetujui. Karena itu pesan ke
 * pengguna bisa berbeda ("menunggu persetujuan" vs "akun dinonaktifkan").
 */
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "pending",
  "approved",
  "rejected",
]);

export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

export const rsvpStatusEnum = pgEnum("rsvp_status", ["going", "cancelled"]);

export const resourceCategoryEnum = pgEnum("resource_category", [
  "code",
  "doc",
  "design",
  "video",
]);

export const socialOwnerTypeEnum = pgEnum("social_owner_type", [
  "user",
  "community",
]);

// ─── Users ────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(), // synced from auth.users.id
    fullname: text("fullname"),
    username: text("username").unique(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").notNull().default("contributor"),
    // Task 9.2 (PRD §4.1): "nonaktifkan akun". Enforced at login and in the
    // dashboard/admin layouts; `role`/`is_active` are NOT in the UPDATE grant
    // — admin changes go through the SECURITY DEFINER RPCs in policies.sql.
    isActive: boolean("is_active").notNull().default(true),
    // Registrasi tidak lagi langsung bisa dipakai: default `pending`, dan
    // admin menyetujui/menolak dari /admin/users. Tidak ada di daftar kolom
    // UPDATE yang di-grant (policies.sql §1) — perubahannya lewat RPC admin.
    approvalStatus: approvalStatusEnum("approval_status")
      .notNull()
      .default("pending"),
    imageUrl: text("image_url"),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_username_idx").on(table.username)]
);

// ─── Social Links ─────────────────────────────────────────

export const socialLinks = pgTable("social_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerType: socialOwnerTypeEnum("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
});

// ─── Events ───────────────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  description: text("description"),
  imageUrl: text("image_url"),
  status: eventStatusEnum("status").notNull().default("upcoming"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  locationName: text("location_name"),
  locationUrl: text("location_url"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Event RSVP ───────────────────────────────────────────

export const eventRsvp = pgTable(
  "event_rsvp",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    status: rsvpStatusEnum("status").notNull().default("going"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("event_rsvp_event_user_idx").on(table.eventId, table.userId),
  ]
);

// ─── Event Speakers ───────────────────────────────────────
//
// Pembicara per event (PRD: kolom baru untuk event speaker). Keputusan desain
// data: nama + foto bebas — TIDAK ada foreign key ke `users`, jadi pembicara
// non-anggota tetap bisa dicatat. `user_id` hanya uuid opsional (tanpa FK)
// yang menautkan ke akun anggota SAJA supaya admin bisa menandai "buat juga
// kontributor proyek"; mengosongkannya tidak masalah.
export const eventSpeakers = pgTable(
  "event_speakers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    topic: text("topic"),
    // Opsional & tanpa FK (lihat catatan di atas).
    userId: uuid("user_id"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("event_speakers_event_idx").on(table.eventId)]
);

// ─── Activities ───────────────────────────────────────────

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  order: integer("order"),
});

// ─── Projects ─────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  content: text("content"),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  status: projectStatusEnum("status").notNull().default("pending"),
  // RLS anchor (src/lib/db/policies.sql): the submitter must be able to read
  // their own row back while it is still `pending` — the contributor row does
  // not exist yet, and INSERT ... RETURNING rows must pass the SELECT policy.
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Project Contributors ─────────────────────────────────

export const projectContributors = pgTable(
  "project_contributors",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => [
    uniqueIndex("project_contributors_idx").on(
      table.projectId,
      table.userId
    ),
  ]
);

// ─── Stacks ───────────────────────────────────────────────

export const stacks = pgTable("stacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

// ─── Project Stacks ───────────────────────────────────────

export const projectStacks = pgTable(
  "project_stacks",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stackId: uuid("stack_id")
      .notNull()
      .references(() => stacks.id),
  },
  (table) => [
    uniqueIndex("project_stacks_idx").on(table.projectId, table.stackId),
  ]
);

// ─── Free Resources ───────────────────────────────────────

export const freeResources = pgTable("free_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  icon: text("icon"),
  category: resourceCategoryEnum("category").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Posts ────────────────────────────────────────────────

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  content: text("content"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  status: postStatusEnum("status").notNull().default("draft"),
  category: text("category"),
  // Task 9.6 (PRD §4.5 "kategori/tag"): free-form tags for cross-category
  // filtering. Stored as a text[]; the article list filters with `contains`.
  tags: text("tags").array(),
  publishedDate: timestamp("published_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── FAQ ──────────────────────────────────────────────────

export const faq = pgTable("faq", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order"),
});

// ─── Community Settings (singleton) ───────────────────────

export const communitySettings = pgTable("community_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  description: text("description"),
  keywords: text("keywords").array(),
  lightLogoUrl: text("light_logo_url"),
  darkLogoUrl: text("dark_logo_url"),
  address: text("address"),
  mapsLocation: text("maps_location"),
});

// ─── Type Exports ─────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
