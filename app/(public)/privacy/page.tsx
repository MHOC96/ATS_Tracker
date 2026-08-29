import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/layout/page-title";
import { LegalProse, LegalSection } from "@/components/public/legal-prose";
import { SurfaceCard } from "@/components/neuro/surface-card";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://ats-galvan.vercel.app";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we collect, use, and protect personal data on our careers and recruitment platform.",
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 29, 2026";

  return (
    <div className="min-w-0 mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <PageTitle
        title="Privacy Policy"
        description={`Last updated: ${lastUpdated}. This policy describes how mhoc operates the careers site and recruitment platform.`}
      />

      <SurfaceCard padding="lg">
        <LegalProse>
          <LegalSection title="1. Who we are">
            <p>
              This careers site and recruitment administration platform
              (&quot;Service&quot;) is operated by mhoc. The public careers pages
              let candidates browse job openings and submit applications. An
              internal admin area is used by authorized recruiters and
              administrators to manage hiring.
            </p>
          </LegalSection>

          <LegalSection title="2. Information we collect">
            <p>When you apply for a job, we may collect:</p>
            <ul>
              <li>Identity and contact details (e.g. name, email, phone)</li>
              <li>Professional information from your CV or resume</li>
              <li>Application metadata (job applied for, submission date)</li>
              <li>
                Files you upload (typically PDF resumes), stored for recruitment
                purposes
              </li>
            </ul>
            <p>
              Admin users who sign in provide account credentials managed through
              our authentication provider. We do not intentionally collect
              sensitive categories of data unless you include them in your
              application materials.
            </p>
          </LegalSection>

          <LegalSection title="3. How we use information">
            <p>We use collected information to:</p>
            <ul>
              <li>Process and evaluate job applications</li>
              <li>Communicate with candidates about their applications</li>
              <li>
                Assist recruiters with structured screening using automated
                tools (see Section 4)
              </li>
              <li>Operate, secure, and improve the Service</li>
              <li>Meet legal obligations where applicable</li>
            </ul>
            <p>
              Automated recommendations do not replace human review for final
              hiring decisions.
            </p>
          </LegalSection>

          <LegalSection title="4. AI and automated processing">
            <p>
              To support recruitment workflows, application materials may be
              processed by third-party AI services for text extraction, skill
              matching, and scoring. Outputs are stored in our database and
              reviewed by authorized staff. We do not use AI to make irreversible
              hiring decisions without human involvement.
            </p>
          </LegalSection>

          <LegalSection title="5. How we store and share data">
            <p>
              Application records are stored in a secure cloud database
              (Supabase PostgreSQL). Uploaded CV files are stored in Google
              Drive under folders controlled by the organization&apos;s
              connected Google account. We share data only with:
            </p>
            <ul>
              <li>Service providers that host infrastructure and AI APIs</li>
              <li>Authorized recruiters and administrators within the organization</li>
              <li>Parties when required by law or to protect rights and safety</li>
            </ul>
            <p>We do not sell personal data.</p>
          </LegalSection>

          <LegalSection title="6. Data retention">
            <p>
              We retain application data for as long as needed to manage the
              recruitment process, comply with law, and resolve disputes.
              Retention periods may vary by role and local requirements. When
              data is no longer required, we delete or anonymize it where
              practicable.
            </p>
          </LegalSection>

          <LegalSection title="7. Security">
            <p>
              We use industry-standard measures including encrypted connections,
              access controls, and role-based permissions. No method of
              transmission or storage is completely secure; we cannot guarantee
              absolute security.
            </p>
          </LegalSection>

          <LegalSection title="8. Your rights">
            <p>
              Depending on your location, you may have rights to access, correct,
              delete, or restrict use of your personal data, or to object to
              certain processing. To exercise these rights, contact the hiring
              organization or reach out through the application process for the
              role you applied to.
            </p>
          </LegalSection>

          <LegalSection title="9. Third-party services">
            <p>
              The Service relies on third parties such as Google (Drive and OAuth),
              Supabase (database and authentication), and AI providers. Their use
              of data is governed by their respective policies when you interact
              with their services directly.
            </p>
          </LegalSection>

          <LegalSection title="10. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. The
              &quot;Last updated&quot; date at the top will reflect changes.
              Continued use of the Service after updates constitutes acceptance
              of the revised policy.
            </p>
          </LegalSection>

          <LegalSection title="11. Contact">
            <p>
              For privacy questions about applications submitted through this
              site, contact the hiring team associated with the job posting or
              visit our{" "}
              <Link href="/" className="text-paper underline hover:text-mist">
                careers home
              </Link>
              .
            </p>
          </LegalSection>
        </LegalProse>
      </SurfaceCard>

      <p className="text-center text-[13px] text-fog">
        See also our{" "}
        <Link href="/terms" className="text-mist underline hover:text-paper">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
