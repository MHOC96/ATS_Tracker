import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/layout/page-title";
import { PUBLIC_APP_NAME } from "@/lib/constants/branding";
import { LegalProse, LegalSection } from "@/components/public/legal-prose";
import { SurfaceCard } from "@/components/neuro/surface-card";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://ats-galvan.vercel.app";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of our careers site and recruitment platform.",
  alternates: { canonical: `${siteUrl}/terms` },
};

export default function TermsOfServicePage() {
  const lastUpdated = "August 29, 2026";

  return (
    <div className="min-w-0 mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <PageTitle
        title="Terms of Service"
        description={`Last updated: ${lastUpdated}. By using this site, you agree to these terms.`}
      />

      <SurfaceCard padding="lg">
        <LegalProse>
          <LegalSection title="1. Agreement">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to
              the careers website and related recruitment services operated by
              mhoc (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) as {PUBLIC_APP_NAME}.
              By accessing or using the Service, you agree to these Terms.
            </p>
          </LegalSection>

          <LegalSection title="2. Eligibility and accounts">
            <p>
              Public careers pages are intended for individuals seeking
              employment. You must provide accurate information when applying.
              Admin accounts are restricted to authorized personnel; you must
              not share credentials or access areas you are not permitted to
              use.
            </p>
          </LegalSection>

          <LegalSection title="3. Job applications">
            <p>When you submit an application:</p>
            <ul>
              <li>You confirm that information you provide is truthful</li>
              <li>
                You grant us permission to store and process your application
                for recruitment purposes
              </li>
              <li>
                You understand that submission does not guarantee employment,
                interview, or response
              </li>
            </ul>
            <p>
              We may reject or remove applications that are incomplete,
              fraudulent, abusive, or unrelated to open roles.
            </p>
          </LegalSection>

          <LegalSection title="4. AI-assisted screening">
            <p>
              Applications may be analyzed using automated tools to extract
              information and generate screening scores. These tools assist
              recruiters but do not constitute a final hiring decision. Human
              reviewers remain responsible for recruitment outcomes.
            </p>
          </LegalSection>

          <LegalSection title="5. Acceptable use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for unlawful purposes</li>
              <li>
                Attempt to access admin systems, other users&apos; data, or
                non-public APIs without authorization
              </li>
              <li>Upload malware, spam, or content unrelated to job applications</li>
              <li>Interfere with or disrupt the Service or its security measures</li>
            </ul>
          </LegalSection>

          <LegalSection title="6. Intellectual property">
            <p>
              Site content, branding, and software are owned by us or our
              licensors. You retain ownership of materials you submit; you grant
              us a limited license to use them solely to operate the recruitment
              process.
            </p>
          </LegalSection>

          <LegalSection title="7. Disclaimer">
            <p>
              The Service is provided &quot;as is&quot; without warranties of
              any kind, express or implied. We do not warrant uninterrupted
              availability, error-free operation, or that the Service will meet
              your requirements.
            </p>
          </LegalSection>

          <LegalSection title="8. Limitation of liability">
            <p>
              To the fullest extent permitted by law, mhoc and its operators
              shall not be liable for indirect, incidental, special,
              consequential, or punitive damages arising from your use of the
              Service. Our total liability for any claim related to the Service
              is limited to the amount you paid us to use it (typically zero for
              public applicants).
            </p>
          </LegalSection>

          <LegalSection title="9. Termination">
            <p>
              We may suspend or terminate access to the Service at any time for
              violation of these Terms, security concerns, or operational
              reasons. Provisions that by nature should survive termination will
              remain in effect.
            </p>
          </LegalSection>

          <LegalSection title="10. Changes">
            <p>
              We may modify these Terms at any time. Material changes will be
              reflected by updating the date above. Your continued use after
              changes constitutes acceptance.
            </p>
          </LegalSection>

          <LegalSection title="11. Governing law">
            <p>
              These Terms are governed by applicable local laws without regard
              to conflict-of-law principles. Disputes shall be resolved in
              courts with appropriate jurisdiction unless otherwise required by
              mandatory consumer protection laws.
            </p>
          </LegalSection>

          <LegalSection title="12. Contact">
            <p>
              Questions about these Terms may be directed through the hiring
              process for relevant job postings or via our{" "}
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
        <Link href="/privacy" className="text-mist underline hover:text-paper">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
