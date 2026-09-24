import Link from "next/link";
import { FeatureCard } from "@/components/getting-started/FeatureCard";
import { CalloutBox } from "@/components/getting-started/CalloutBox";
import { CodeTabs } from "@/components/getting-started/CodeTabs";
import { SetupStep } from "@/components/getting-started/SetupStep";
import { PageToc } from "@/components/getting-started/PageToc";
import { PageFeedback } from "@/components/getting-started/PageFeedback";
import { TicketIcon, SparkleIcon, SearchIcon, SendIcon } from "@/components/getting-started/icons";

export default function GettingStartedPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-6 py-10">
      <div className="min-w-0 flex-1">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Back to app
        </Link>

        <section id="introduction" className="mt-6 scroll-mt-20">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Getting Started with AI Jira Ticket Assistant
          </h1>
          <p className="mt-4 text-zinc-600">
            AI Jira Ticket Assistant connects to your real Jira instance, retrieves relevant
            internal knowledge from Confluence and internal SOPs, and drafts a grounded,
            ready-to-post response for any ticket.
          </p>
          <p className="mt-3 text-zinc-600">
            You review and edit the suggested response before it ever reaches Jira. Nothing
            posts automatically.
          </p>
        </section>

        <section id="what-can-you-do" className="mt-12 scroll-mt-20">
          <h2 className="text-xl font-semibold text-zinc-900">
            What can you do with AI Jira Ticket Assistant?
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={<TicketIcon className="size-5" />}
              title="Jira Fetch"
              description="Pull a ticket's summary, description, and status directly from Jira via TWG CLI, using your real authenticated session."
            />
            <FeatureCard
              icon={<SparkleIcon className="size-5" />}
              title="AI Analysis"
              description="Claude classifies the request, extracts key entities, and generates targeted search queries for retrieval."
            />
            <FeatureCard
              icon={<SearchIcon className="size-5" />}
              title="Knowledge Search"
              description="Semantically search ingested Confluence pages and internal SOPs to ground the response in real documentation."
            />
            <FeatureCard
              icon={<SendIcon className="size-5" />}
              title="Review & Post"
              description='Edit the AI-drafted response, then post it to Jira with one explicit action. Nothing posts automatically.'
            />
          </div>
        </section>

        <section id="setup" className="mt-12 scroll-mt-20">
          <h2 className="text-xl font-semibold text-zinc-900">Set up your first project</h2>
          <p className="mt-1 text-sm text-zinc-600">
            If you want to get hands-on right away, follow these steps.
          </p>

          <div className="mt-6 flex flex-col gap-8">
            <SetupStep
              number={1}
              title="Install dependencies"
              description="Clone the repo and install packages with your preferred package manager."
            >
              <CodeTabs commands={{ npm: "npm install", pnpm: "pnpm install" }} />
            </SetupStep>

            <SetupStep
              number={2}
              title="Configure your environment"
              description="Copy the example env file and add your Jira, Anthropic, and Voyage credentials."
            >
              <CalloutBox>
                Never commit <code className="rounded bg-orange-100 px-1 py-0.5">.env.local</code>{" "}
                — it&apos;s already gitignored. Get a Jira API token from id.atlassian.com and an
                Anthropic key from console.anthropic.com.
              </CalloutBox>
              <CodeTabs commands={{ bash: "cp .env.local.example .env.local" }} />
            </SetupStep>

            <SetupStep
              number={3}
              title="Set up the database"
              description="Apply the Prisma schema to create your local SQLite database."
            >
              <CodeTabs commands={{ npx: "npx prisma migrate dev" }} />
            </SetupStep>

            <SetupStep
              number={4}
              title="Run the app"
              description="Start the dev server and open the app in your browser."
            >
              <CodeTabs commands={{ npm: "npm run dev" }} />
            </SetupStep>
          </div>
        </section>

        <section id="try-it" className="mt-12 scroll-mt-20 pb-16">
          <h2 className="text-xl font-semibold text-zinc-900">Try it with a real ticket</h2>
          <p className="mt-1 text-sm text-zinc-600">Once the app is running:</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
            <li>
              Enter a ticket key like <code className="rounded bg-zinc-100 px-1 py-0.5">KAN-4</code>{" "}
              in the input field on the home page.
            </li>
            <li>Review the AI&apos;s suggested response, confidence level, and any missing information.</li>
            <li>
              Edit the response if needed, then click &quot;Post comment to Jira&quot; to publish it.
            </li>
          </ol>
          <p className="mt-4 text-sm text-zinc-600">
            Nothing is posted until you take that explicit action.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Go to the app →
          </Link>
        </section>
      </div>

      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-10 flex flex-col gap-6">
          <PageToc />
          <PageFeedback />
        </div>
      </aside>
    </div>
  );
}
