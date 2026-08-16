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

// 10pt: the smallest size recruiters read comfortably; below it the page
// fails the six-second scan because nothing is legible at arm's length. One
// page is held by trading content out rather than shrinking the type — see the
// "CUT FOR SPACE" ledger below for everything removed to hold this size. If
// you add content, run `pnpm resume:check` — it fails the build rather than
// letting a two-page resume ship.
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
  // body-font-size is set above; it was once dropped to 8pt to force a single
  // page, and is back at the readable floor now that content was cut instead.
  font-size: body-font-size,
)

// MUST come after the `#show: resume.with(...)` line. basic-resume calls
// `set document(title: author)` internally, so setting this earlier gets
// clobbered and the browser tab reads "Kenneth Chen Ko Han" instead.
// Some ATS parsers read this field.
#set document(title: name + " — Resume", author: name)

// basic-resume leaves par.spacing at the Typst default (1.2em). 1.0em is the
// loosest value at which US Letter — the shorter of the two pages, so always
// the binding constraint — still lands on one page at 10pt. Loosen it past
// what `pnpm resume:check` allows and the build fails.
#set par(spacing: 1.0em)

// Section headings carry Typst's default block spacing, which opens a band of
// whitespace above each of the six sections. 0.85em is the loosest that keeps
// the page on one sheet; the 10pt body is the readability that matters.
#show heading.where(level: 2): set block(above: 0.85em, below: 0.15em)

// ============================================================================
// Dates, award years and bullet detail are taken from Resume_v3 (2025).
// Do not invent values for anything still marked TODO below.
//
//  [ ] ATC-ASR: the previous SOTA that the 5.99% WER beat. The figure is in,
//      but "state-of-the-art" reads stronger against the number it displaced.
//  [ ] SP Scholarship year — assumed the 2021 intake, not stated on Resume_v3.
//
// CUT FOR SPACE from Resume_v3, all real, restore by trading something out:
//  - Extracurriculars: Founder of the SP Competitive Programming Interest
//    Group and VP of the AI Club (both 2022).
//  - Competitions: Hackomania 2024 (top 5%), ASEAN Data Science Explorers 2024
//    (2nd in Singapore), Reply CodeTeen 2023 (92nd/1,400), GovTech GeekOut
//    2022 (1st/10).
//  - RAiD: supervising technical decisions on the RSAF video analytics
//    platform alongside NUS graduate students and NCS engineers.
//  - SP: 14 distinctions. (NUS Merit Scholarship is kept, but under Education
//    rather than duplicated here.)
//
// CUT TO RESTORE THE 10pt FLOOR (all real, restore by trading something out):
//  - SP coursework list (duplicated the Skills block).
//  - The whole Makeable Technical Interviewer entry (non-engineering, lowest
//    signal; Resumify still carries the "Present" coverage).
//  - Resumify: the SPD sharing session, the agentic-tooling list (OpenCode,
//    Ralph loop, oh-my-openagent, Semble Search) and the Stack line.
//  - RAiD: the per-model fine-tune list (parakeet-tdt, canary-1b, NGPU-LM) and
//    the hackathon search-tool bullet.
//  - Bifrost: the StabilityAI VAE bullet.
//  - GovTech: the SegGPT/SAM prototype and the LoRA red-team bullet.
//  - Awards: DSTA BrainHack CODE_EXP 2024 (finalist — weakest of the three).
//  - ATC-ASR: "now averaging 70" downloads — a declining trend undercuts the
//    peak number.
//  - CodeVita: "17th of 30 at the Grand Finale" — a mid-pack placing undercuts
//    "8th of 100,000+".
//  - Skills: HTML, CSS, Hyperopt, Weights & Biases, Tailwind CSS, Render, Git,
//    LaTeX, Typst (assumed or non-job-relevant).
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
- *NUS Merit Scholarship* -- awarded to high-calibre freshmen on academic results, leadership qualities and co-curricular record.

// basic-resume's #edu accepts a `gpa` argument and then never renders it -
// neither branch of the function references it. The CGPA has to ride along in
// the degree string to appear at all.
#edu(
  institution: "Singapore Polytechnic",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2021", end-date: "Apr 2024"),
  degree: "Diploma in Applied AI and Analytics, CGPA: 4.0/4.0",
  gpa: "4.0/4.0",
  consistent: true,
)
- *Lee Kuan Yew Award for Mathematics & Science* -- top tech graduate, *IMDA Gold Medal* -- top all-around achiever, *SP Scholarship*.

== Work Experience

// Under Work Experience, not Projects. ATS parsers build employment history
// from this section and either drop a Projects entry or file it somewhere the
// company's portal never reads, so a co-founded org with a title, dates and a
// funded track record was being thrown away at exactly the moment it counted.
// `company` is kept plain - the resumify.org link rides in the first bullet
// rather than in the company field, where a parenthetical would end up inside
// the parsed employer name.
#work(
  company: "Resumify",
  title: "Co-founder and AI Lead",
  location: "Singapore",
  dates: dates-helper(start-date: "Nov 2023", end-date: "Present"),
)
- Non-profit built with YellowRibbon.gov.sg, HTX, the Singapore Prison Service and SPD (#link("https://resumify.org")[resumify.org]); AI-powered resume services now delivered to 600+ users.
- Awarded SGD 24,000 in funding by the National Youth Council; signed a 12-month MOU with YellowRibbon; featured in The Business Times and #link("https://www.zaobao.com.sg/realtime/singapore/story20250729-7237751")[Lianhe Zaobao].

#work(
  // Parenthesised, not comma-separated: parsers commonly split an employer
  // field on the comma, which would drop "RAiD" entirely. Inside brackets it
  // survives as part of the one company string.
  company: "Republic of Singapore Air Force (RAiD)",
  title: "AI Engineer (Volunteer)",
  location: "Singapore",
  dates: dates-helper(start-date: "Oct 2023", end-date: "Jun 2026"),
)
- Built the full-stack system that analyses Air Traffic Control situations: an NVIDIA NeMo speech-recognition and diarisation layer feeding a Qwen3 reasoning layer served with vLLM.
- Deployed it to edge devices for real-time transcription in the control room; presented to the Chief of Air Force.

#work(
  company: "Bifrost AI",
  title: "AI Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2024", end-date: "Jun 2024"),
)
- Trained YOLOv6-lite for military tank detection with ST Engineering at a Sequoia Capital-backed synthetic-data startup; incremental-learning tuning lifted accuracy 16%+.
- Prototyped a zero-shot JinaCLIP method to visualise missing data for NASA, BigBear AI and DSTA.

// Employer field kept to the company alone - three comma-separated parts read
// as one employer name to a human, but a parser splitting on commas produces
// nonsense. The team sits in the first bullet.
#work(
  company: "GovTech Singapore",
  title: "AI Engineer Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2023", end-date: "Mar 2024"),
)
- Video Analytics team (DSAID). Lead AI engineer on a computer-vision pipeline for MSO's OneService App on AWS (EKS, SageMaker), classifying thousands of daily municipal reports via zero-shot ensembles.
- Built real-time animal welfare detection for NParks with OWLv2, tuned by Bayesian optimisation (Hyperopt); the pitch secured executive-board funding.

== Projects

// "ATC-ASR" on its own means nothing outside the niche, so the first mention
// is spelled out and the acronym is introduced after it.
#project(
  name: "Air Traffic Control Automatic Speech Recognition (ATC-ASR)",
  url: "huggingface.co/qenneth",
  dates: "2025",
)
- Fine-tuned parakeet-tdt-0.6b-v3 with NVIDIA NeMo to a state-of-the-art 5.99% Word Error Rate on the Jacktol ATC-ASR test split, trained in under an hour on a single H200; 200+ Hugging Face downloads a month at peak.

== Publications

// Italic, not bold: paper titles are conventionally italicised, and a bold
// run this long outweighed every job title on the page. The venue on the
// right is the signal a reader is actually scanning for.
// Verified against aclanthology.org/2025.acl-long.916: Main Conference,
// Volume 1 (Long Papers), not Findings. The BibTeX byline is
// "Han, Kenneth Chen Ko" - the same name as the header, so there is no
// name mismatch to explain away.
#generic-one-by-two(
  left: [_Crowdsource, Crawl, or Generate? Creating SEA-VL, a Multicultural Vision-Language Dataset for Southeast Asia_],
  right: link("https://aclanthology.org/2025.acl-long.916/")[ACL 2025],
)
- Co-author on a 100+ author SEACrowd collaboration; annotated Myanmar-specific imagery and contributed to the writing.

== Awards and Competitions

// NOTE: the blank lines between these are load-bearing. Without a paragraph
// break, consecutive generic-one-by-two calls reflow into a single run-on
// paragraph instead of one line per award. The `set par` tightens the gap
// those breaks would otherwise open up - the default was eating a visible
// band of whitespace for a two-line section.
//
// The two Singapore Polytechnic awards (Lee Kuan Yew Award, IMDA Gold Medal)
// live under Education instead, to save the vertical space.
#[
  #set par(spacing: 0.5em)

  #generic-one-by-two(
    left: [*TCS CodeVita S10* -- 8th of 100,000+ students globally],
    right: "2023",
  )

  #generic-one-by-two(
    left: [*USA Computing Olympiad* -- Gold Division],
    right: "2025",
  )
]

== Skills

// Deliberately repeats tools already named in the bullets above. Many ATS
// parsers lift this section into a structured skills field and match against
// that, so a keyword that appears only in prose can be missed entirely.
*Languages*: Python, C++, TypeScript, JavaScript, SQL, Bash \
*Machine Learning*: PyTorch, Hugging Face, NVIDIA NeMo, vLLM, scikit-learn, NumPy, Pandas, OpenCV, LoRA \
*Web, Cloud and Data*: Next.js, React, FastAPI, Node.js, Supabase, MySQL, MongoDB, OpenAI API, AWS (EKS, SageMaker), Docker, Vercel
