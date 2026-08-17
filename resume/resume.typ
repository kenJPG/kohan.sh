#import "@preview/basic-resume:0.2.9": *

// The template's #work puts the role in bold on the first line and the
// company in plain text underneath. Recruiters and ATS parsers scan for the
// employer first — the company is the signal that decides whether the rest of
// the entry gets read — so this override swaps the emphasis: company name
// leads, bold; the role follows on the second line. Layout matches the
// template's generic-two-by-two exactly, only the strong() moves.
#let work(
  title: "",
  dates: "",
  company: "",
  location: "",
) = {
  generic-two-by-two(
    top-left: strong(company),
    top-right: dates,
    bottom-left: title,
    bottom-right: emph(location),
  )
}

// Paper size is switched at compile time so one source produces both outputs:
//   typst compile resume/resume.typ --input paper=a4        public/kenneth-chen-ko-han-resume.pdf
//   typst compile resume/resume.typ --input paper=us-letter public/kenneth-chen-ko-han-resume-letter.pdf
#let paper-size = sys.inputs.at("paper", default: "a4")

// 10pt: the smallest size a recruiter reads comfortably at arm's length, and
// the template's own default. An earlier revision drove this to 8pt to force
// one page, which is the wrong trade — a page nobody can skim has failed
// regardless of what is on it. One page is held by trading content out
// instead; see the CUT ledger below for what came off and what it bought.
// If you add content, run `pnpm resume:check` — it fails the build rather
// than letting a two-page resume ship.
#let body-font-size = 10pt

#let name = "Kenneth Chen Ko Han"
#let location = "Singapore"
#let email = "kenneth.chen1337@gmail.com"
#let github = "github.com/kenJPG"
#let linkedin = "linkedin.com/in/kenneth-chen-ko-han"
#let phone = sys.inputs.at("phone", default: "+65 XXXX XXXX")
#let personal-site = "kohan.sh"

#show: resume.with(
  author: name,
  location: location,
  email: email,
  github: github,
  linkedin: linkedin,
  phone: phone,
  personal-site: personal-site,
  accent-color: "#26282b",
  font: "New Computer Modern",
  paper: paper-size,
  author-position: left,
  personal-info-position: left,
  font-size: body-font-size,
)

// MUST come after the `#show: resume.with(...)` line. basic-resume calls
// `set document(title: author)` internally, so setting this earlier gets
// clobbered and the browser tab reads "Kenneth Chen Ko Han" instead.
// Some ATS parsers read this field.
#set document(title: name + " — Resume", author: name)

// basic-resume leaves par.spacing at the Typst default (1.2em). 0.95em is the
// loosest value at which US Letter — the shorter of the two pages, so always
// the binding constraint — still lands on one page at 10pt.
#set par(spacing: 0.95em)

// basic-resume draws each section heading as small-caps text followed by a
// full-width rule, separated by `pad(bottom: -10pt)` — a hard-coded negative
// pad that pulls the rule 10pt upwards. At this font size that is most of a
// line height, so the rule lands on the letterforms and every section title
// reads as struck through. Overriding the whole show rule rather than the
// surrounding block: the collision is *inside* the heading, between the text
// and its own underline, so no amount of block(above:) or block(below:) can
// reach it.
//
// -3pt still tucks the rule close enough to read as an underline rather than
// a free-floating divider, without touching the glyphs. Stroke is 0.5pt, not
// the template's 1pt: at 10pt body text a full-point rule is heavier than the
// small caps sitting on it and pulls the eye away from the content.
#show heading.where(level: 2): it => [
  #pad(top: 0pt, bottom: -3pt, smallcaps(it.body))
  #line(length: 100%, stroke: 0.5pt)
]

// Compensates for the height the rule fix gives back across six headings.
// Space above a heading separates it from the previous section and is the
// cheaper of the two gaps to spend.
#show heading.where(level: 2): set block(above: 0.45em, below: 0.3em)

// ============================================================================
// Dates, award years and bullet detail are taken from Resume_v3 (2025).
// Do not invent values for anything still marked TODO below.
//
//  [ ] SP Scholarship year — assumed the 2021 intake, not stated on Resume_v3.
//  [ ] NUS College reads as a parenthetical with no context. A peer resume in
//      the same programme quantifies it ("Handpicked for NUSC, 4% acceptance
//      rate"), which turns an unfamiliar credential into a number a recruiter
//      can rank. Verify the current figure before using it — do not copy a
//      number off someone else's resume.
//  [ ] Outcome metrics are missing from the build-heavy bullets. Chloe, the
//      ATC system and the job matcher all say what was built, not what changed:
//      no latency, throughput, uptime, adoption or accuracy delta. If any of
//      those numbers exist, they are the highest-value edit left on this page.
//  [ ] Jun 2024 -> Aug 2026 reads as a gap unless the RAiD entry is understood
//      to span it. National Service is deliberately not listed (Kenneth's
//      call). If a recruiter ever raises it, the zero-cost fix is four words
//      in the RAiD title: "(Volunteer, alongside National Service)".
//
// CUT — weak or self-undercutting, do not restore:
//  - CodeVita "17th of 30 at the Grand Finale": a mid-pack placing sitting
//    next to "8th of 100,000+" argues against the number beside it.
//  - ATC-ASR "now averaging 70" downloads: a declining trend volunteered
//    against a peak figure.
//  - DSTA BrainHack CODE_EXP 2024 (finalist): weakest of the competitions,
//    and "finalist" is the least specific placing on the page.
//  - SP coursework list: duplicated the Skills block outright.
//  - Resumify "Stack:" line: the stack is now visible in the work it describes
//    rather than asserted as a list.
//  - Company-context bullets ("Series A startup backed by Sequoia Capital",
//    "San Francisco startup backed by Afore Capital"): folded into the
//    achievement bullet they qualified, one clause instead of a whole line.
//
// CUT FOR SPACE — all real, restore by trading something out:
//  - Makeable.build, Technical Interviewer (Jul 2026 - Present, SF remote,
//    Afore Capital-backed): designed and ran the technical interview loop.
//    The only US-company role and the only other "Present" line, but it is
//    not engineering output, which is what AI/ML and SWE screens read for.
//  - GovTech: SegGPT/SAM feature-explainability prototype.
//  - RAiD: LLM-powered internal search tool built at a hackathon hosted at
//    Microsoft's office.
//  - Extracurriculars: Founder of the SP Competitive Programming Interest
//    Group and VP of the AI Club (both 2022).
//  - Competitions: Hackomania 2024 (top 5%), ASEAN Data Science Explorers
//    2024 (2nd in Singapore), Reply CodeTeen 2023 (92nd/1,400), GovTech
//    GeekOut 2022 (1st/10).
//  - SP: 14 distinctions.
//  - Skills: HTML, CSS, Tailwind CSS, Weights & Biases, Node.js, MySQL,
//    MongoDB, Vercel, Render, Git, LaTeX, Typst, OpenAI API. The last is a
//    floor rather than a differentiator in 2026; vLLM and NeMo say more.
// ============================================================================

== Education

// `consistent: true` puts the dates top-right and the location bottom-right,
// which is the order #work uses. Without it the template flips them for
// Education only, so dates read roman-on-line-one under Work Experience and
// italic-on-line-two under Education - the same field, styled two ways.
// dates-helper, not a literal string: it emits an em dash, so this range
// matches every other date range on the page instead of using a hyphen.
#edu(
  institution: "National University of Singapore",
  location: "Singapore",
  dates: dates-helper(start-date: "Aug 2026", end-date: "May 2029"),
  degree: "B.Comp. in Computer Science (NUS College), Minor in Mathematics",
  gpa: "",
  consistent: true,
)
// The award's definition clause was dropped: a recruiter reads the name, not
// its rubric, and no other award on the page explains itself either.
- *NUS Merit Scholarship*.

// basic-resume's #edu accepts a `gpa` argument and then never renders it -
// neither branch of the function references it. The CGPA has to ride along in
// the degree string to appear at all.
#edu(
  institution: "Singapore Polytechnic",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2021", end-date: "Apr 2024"),
  degree: "Diploma in Applied AI and Analytics",
  gpa: "4.0/4.0",
  consistent: true,
)
// CGPA moved out of the degree string and promoted to the front of the bullet,
// in bold. A perfect GPA is one of the highest-signal facts on the page and it
// was riding in the italic degree line - the least scannable position there is.
// It now leads the line the eye lands on after the institution name.
- *CGPA 4.0/4.0.* *Lee Kuan Yew Award for Mathematics & Science* -- top tech graduate, *IMDA Gold Medal* -- top all-around achiever, *SP Scholarship*.

== Work Experience

// Under Work Experience, not Projects. ATS parsers build employment history
// from this section and either drop a Projects entry or file it somewhere the
// company's portal never reads, so a co-founded org with a title, dates and a
// funded track record was being thrown away at exactly the moment it counted.
// `company` is kept plain - the resumify.org link rides in a bullet rather
// than in the company field, where a parenthetical would end up inside the
// parsed employer name.
#work(
  company: "Resumify",
  title: "Co-founder and AI Lead",
  location: "Singapore",
  dates: dates-helper(start-date: "Nov 2023", end-date: "Present"),
)
// These two bullets replace a "Stack: ..." list and a partners/funding/press
// pair that between them contained no engineering at all - which left the most
// senior title on the page saying nothing about what was built. Detail is
// taken from the resumify repo (backend/src/api/routes/elevenlabs_webhooks.py,
// jobs.py); do not embellish past what ships there.
// "tool-calling webhooks", not "tool webhooks": tool-calling is the term the
// 2026 screens and keyword filters actually match on, and it is exactly what
// these endpoints are. Same claim, indexable wording.
- Built Chloe, a production ElevenLabs voice agent on FastAPI/Next.js/Supabase: seven authenticated tool-calling webhooks (resume analysis, section generation, keyword optimisation) with tool-call dedup and session-lifecycle reconciliation.
- Shipped embedding-based resume-to-job matching (cosine similarity over a Supabase-backed vector index) and a Playwright PDF pipeline across three multi-tenant deployments.
- Non-profit with YellowRibbon.gov.sg, HTX, Singapore Prison Service and SPD (#link("https://resumify.org")[resumify.org]); 600+ users, SGD 24,000 National Youth Council grant, 12-month MOU, covered in The Business Times and #link("https://www.zaobao.com.sg/realtime/singapore/story20250729-7237751")[Lianhe Zaobao].

#work(
  // Parenthesised, not comma-separated: parsers commonly split an employer
  // field on the comma, which would drop "RAiD" entirely. Inside brackets it
  // survives as part of the one company string.
  company: "Republic of Singapore Air Force (RAiD)",
  title: "AI Engineer (Volunteer)",
  location: "Singapore",
  dates: dates-helper(start-date: "Oct 2023", end-date: "Jun 2026"),
)
// The per-model list (parakeet-tdt, canary-1b, NGPU-LM) came off here rather
// than anywhere else: the Projects section already opens with "Fine-tuned
// parakeet-tdt-0.6b-v3 with NVIDIA NeMo", so naming the models twice spent a
// line restating the page's own strongest bullet.
- Built the full-stack system analysing Air Traffic Control situations: an NVIDIA NeMo speech-recognition and diarisation layer feeding a Qwen3 reasoning layer served with vLLM.
- Deployed it to edge devices for real-time transcription in the control room; presented to the Chief of Air Force.
// Restored. Supervising graduate students and contracted engineers as an
// undergraduate is a seniority signal nothing else on the page carries, and it
// was cut purely for space in an 8pt draft that had no space to begin with.
- Supervised technical decisions on the RSAF video analytics platform alongside NUS graduate students and NCS engineers.

#work(
  company: "Bifrost AI",
  title: "AI Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2024", end-date: "Jun 2024"),
)
- Trained YOLOv6-lite for tank detection with ST Engineering at a Sequoia-backed synthetic-data startup; incremental-learning tuning lifted accuracy 16%+.
// Restored: generative-model depth, and the one bullet on the page that shows
// work below the API line. That reads directly for AI/ML lab screens.
- Fine-tuned a StabilityAI VAE to improve text and high-frequency reconstruction for synthetic-to-real domain adaptation.

// Employer field kept to the company alone - three comma-separated parts read
// as one employer name to a human, but a parser splitting on commas produces
// nonsense. The team sits in the first bullet.
#work(
  company: "GovTech Singapore",
  title: "AI Engineer Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2023", end-date: "Mar 2024"),
)
// This entry sits last under reverse-chronological ordering, so its first six
// words are the only ones guaranteed to be read. They used to be an org name
// ("Video Analytics team, Data Science and AI Division.") - the team is
// context, not the achievement. Role and scope lead now.
- Lead AI engineer on the production computer-vision pipeline for MSO's OneService App (Video Analytics, DSAID): zero-shot ensembles classifying thousands of daily municipal reports on AWS (EKS, SageMaker).
// Outcome-first. This bullet buried its result ("secured executive-board
// funding") behind a semicolon at the end of the line; the funding is the
// thing a reader is scanning for, and the model and tuning method are how it
// was earned. Same facts, result in front.
- Secured executive-board funding for real-time animal welfare detection built for NParks with OWLv2, tuned by Bayesian optimisation (Hyperopt).
// Restored: adversarial/red-team work is a scarce signal and reads directly
// for safety and evaluation teams, which is where AI labs are hiring.
- Red-teamed GovTech's AI Image Detector with custom-trained LoRAs simulating locally contextualised deepfakes.

== Projects

// "ATC-ASR" on its own means nothing outside the niche, so the first mention
// is spelled out and the acronym is introduced after it.
#project(
  name: "Air Traffic Control Automatic Speech Recognition (ATC-ASR)",
  url: "huggingface.co/qenneth",
  dates: "2025",
)
// "State-of-the-art" with no baseline invites "SOTA against what?" in the
// interview and converts a strength into a credibility question. The displaced
// figure is 6.5%, so the claim now carries its own evidence. "Hugging Face
// downloads" -> "downloads": the entry URL already says huggingface.co.
- Fine-tuned parakeet-tdt-0.6b-v3 with NVIDIA NeMo to 5.99% Word Error Rate on the Jacktol ATC-ASR split, beating the previous state of the art of 6.5%; trained in under an hour on a single H200. 200+ downloads a month at peak.

== Publications

// Italic, not bold: paper titles are conventionally italicised, and a bold
// run this long outweighed every job title on the page.
// Verified against aclanthology.org/2025.acl-long.916: Main Conference,
// Volume 1 (Long Papers), not Findings. The BibTeX byline is
// "Han, Kenneth Chen Ko" - the same name as the header, so there is no
// name mismatch to explain away.
//
// NOT generic-one-by-two. That helper puts the venue in a fixed right-hand
// column and gives the left column no room to wrap, so this title - the
// longest string on the page - ran straight into "ACL 2025" with no gap
// ("...for Southeast AsiaACL 2025"). Inline instead, so the title wraps
// normally and the venue trails it. `~` is a non-breaking space: without it
// the venue split across the wrap as "... Asia - ACL" / "2025".
_Crowdsource, Crawl, or Generate? Creating SEA-VL, a Multicultural Vision-Language Dataset for Southeast Asia_ -- #link("https://aclanthology.org/2025.acl-long.916/")[ACL~2025].
- Co-author on a 100+ author SEACrowd collaboration; contributed Myanmar-specific annotation and writing.

== Awards and Competitions

// One line, years inline, rather than two right-aligned rows. A two-item
// section was spending a row plus a paragraph gap per entry; the right-hand
// year column is the cheapest thing on the page to give up, and content was
// preferred over formatting everywhere else.
//
// The two Singapore Polytechnic awards (Lee Kuan Yew Award, IMDA Gold Medal)
// live under Education instead, to save the vertical space.
*TCS CodeVita S10* -- 8th of 100,000+ students globally (2023) #h(1em) *USA Computing Olympiad* -- Gold Division (2025)

== Skills

// Deliberately repeats tools already named in the bullets above. Many ATS
// parsers lift this section into a structured skills field and match against
// that, so a keyword that appears only in prose can be missed entirely.
// Four category lines became two: the originals carried three databases and
// four deploy targets for what is an AI/ML and SWE application.
*Languages*: Python, C++, TypeScript, JavaScript, SQL, Bash \
// "Kubernetes" spelled out alongside EKS: EKS *is* Elastic Kubernetes Service,
// so this is accurate rather than padding, and "Kubernetes" is the token an
// infrastructure screen greps for. "AWS (EKS)" alone does not match it.
*ML and Systems*: PyTorch, Hugging Face, NVIDIA NeMo, vLLM, LoRA, scikit-learn, NumPy, Pandas, OpenCV, ElevenLabs, Next.js, React, FastAPI, Supabase, PostgreSQL, AWS (EKS, SageMaker), Kubernetes, Docker
