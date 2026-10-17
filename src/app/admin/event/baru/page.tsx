import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          Buat Event Baru
        </h1>
        <p className="mt-1 text-sm text-muted">
          Isi detail event yang akan diselenggarakan.
        </p>
      </div>

      <EventForm />
    </div>
  );
}
