import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * react-markdown hands every element component a `node` prop (the hast node).
 * Spreading it onto a DOM element leaks `node="[object Object]"` into the
 * markup, so it is stripped here.
 */
function dom<P extends { node?: unknown }>(props: P): Omit<P, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest as Omit<P, "node">;
}

/**
 * Renders article Markdown.
 *
 * Raw HTML is intentionally not enabled (`rehype-raw` is not installed), so a
 * stray `<script>` in an article body is escaped instead of executed.
 *
 * The project does not use `@tailwindcss/typography`, so each element is
 * styled explicitly here — dengan token neo-brutalist yang sama seperti
 * halaman lain.
 */
export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`text-foreground ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1
              className="mt-10 mb-3 font-black uppercase leading-none text-2xl"
              {...dom(props)}
            />
          ),
          h2: (props) => (
            <h2
              className="mt-10 mb-3 font-black uppercase leading-none text-xl"
              {...dom(props)}
            />
          ),
          h3: (props) => (
            <h3
              className="mt-6 mb-2 font-black uppercase text-lg"
              {...dom(props)}
            />
          ),
          h4: (props) => (
            <h4
              className="mt-4 mb-2 font-bold text-base"
              {...dom(props)}
            />
          ),
          p: (props) => <p className="my-4 leading-relaxed" {...dom(props)} />,
          ul: (props) => (
            <ul className="my-4 list-disc space-y-1 pl-6" {...dom(props)} />
          ),
          ol: (props) => (
            <ol className="my-4 list-decimal space-y-1 pl-6" {...dom(props)} />
          ),
          li: (props) => <li className="leading-relaxed" {...dom(props)} />,
          blockquote: (props) => (
            <blockquote
              className="my-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-3 p-4 italic text-muted"
              {...dom(props)}
            />
          ),
          hr: (props) => (
            <hr
              className="my-8 border-0 border-t-[3px] border-[var(--hard-border)]"
              {...dom(props)}
            />
          ),
          a: ({ href, ...props }) => {
            const isExternal = /^https?:\/\//.test(href ?? "");
            return (
              <a
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="font-bold text-teal-600 underline underline-offset-2 hover:text-teal-700 dark:text-teal-300"
                {...dom(props)}
              />
            );
          },
          strong: (props) => (
            <strong className="font-black text-foreground" {...dom(props)} />
          ),
          pre: (props) => (
            <pre
              className="my-5 overflow-x-auto rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-navy p-4 text-sm text-white"
              {...dom(props)}
            />
          ),
          code: ({ className: codeClassName, children: codeChildren, ...props }) => {
            const isBlock =
              /language-/.test(codeClassName ?? "") ||
              String(codeChildren).includes("\n");

            if (isBlock) {
              // `pre` already provides the card; keep the block code plain.
              return (
                <code className={codeClassName} {...dom(props)}>
                  {codeChildren}
                </code>
              );
            }

            return (
              <code
                className="border-2 border-[var(--hard-border)] bg-brand-yellow px-1.5 py-0.5 font-mono text-[0.85em] text-black"
                {...dom(props)}
              >
                {codeChildren}
              </code>
            );
          },
          table: (props) => (
            <div className="my-5 overflow-x-auto">
              <table
                className="w-full border-collapse border-[3px] border-[var(--hard-border)] text-sm"
                {...dom(props)}
              />
            </div>
          ),
          th: (props) => (
            <th
              className="border-2 border-[var(--hard-border)] bg-surface-3 px-3 py-2 text-left font-black uppercase"
              {...dom(props)}
            />
          ),
          td: (props) => (
            <td
              className="border-2 border-[var(--hard-border)] px-3 py-2"
              {...dom(props)}
            />
          ),
          img: ({ alt, ...props }) => (
            // Deliberately a plain <img>: the URL comes from the article body,
            // so its host is whatever the author typed. next/image would reject
            // every host that is not in `images.remotePatterns` (only Supabase
            // Storage is listed), which would silently break those articles.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="my-5 border-[3px] border-[var(--hard-border)]"
              alt={alt ?? ""}
              {...dom(props)}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
