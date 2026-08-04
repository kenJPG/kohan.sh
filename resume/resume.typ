#import "@preview/basic-resume:0.2.9": *

// Paper size is switched at compile time so one source produces both outputs:
//   typst compile resume/resume.typ --input paper=a4        public/kenneth-chen-ko-han-resume.pdf
//   typst compile resume/resume.typ --input paper=us-letter public/kenneth-chen-ko-han-resume-letter.pdf
#let paper-size = sys.inputs.at("paper", default: "a4")

// US Letter is ~50pt shorter than A4, which is worth about four lines here.
// Rather than cut real content from one variant, the type scales slightly so
// BOTH paper sizes land on exactly one page. If you add or remove content,
// recompile both and re-check the page count — see `pnpm resume:check`.
#let body-font-size = if paper-size == "us-letter" { 9pt } else { 9.5pt }

#let name = "Kenneth Chen Ko Han"
#let location = "Singapore"
#let email = "kenneth.chen1337@gmail.com"
#let github = "github.com/kenJPG"
#let linkedin = "linkedin.com/in/kenneth-chen-ko-han"
#let phone = "+65 9735 9296"
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
  // 10pt is the template default; see body-font-size above for why this is
  // smaller and why it depends on paper size.
  font-size: body-font-size,
)

// MUST come after the `#show: resume.with(...)` line. basic-resume calls
// `set document(title: author)` internally, so setting this earlier gets
// clobbered and the browser tab reads "Kenneth Chen Ko Han" instead.
// Some ATS parsers read this field.
#set document(title: name + " — Resume", author: name)

// ============================================================================
// OUTSTANDING TODOs — kept as comments so they don't consume page space.
// Every one of these is a real gap. Do not invent values to fill them.
//
//  [ ] Start/end MONTHS for all three work entries and both projects.
//      Only year ranges exist in content.json; resumes need month precision.
//  [ ] Exact start/end months for the Singapore Polytechnic diploma.
//  [ ] Resumify URL (or delete the url: argument entirely).
//  [ ] RAiD: one quantified outcome — WER delta, hours of audio, users served.
//  [ ] ATC-ASR: the actual WER figure and the previous SOTA it beat.
//      "State-of-the-art" without a number is the weakest form of the claim.
//  [ ] Confirm ACL 2025 Main Conference vs. Findings, then fix the venue line.
//  [ ] Years for Lee Kuan Yew Award, IMDA Gold Medal, SP Scholarship,
//      Reply CodeTeen.
// ============================================================================

== Education

#edu(
  institution: "National University of Singapore",
  location: "Singapore",
  dates: "Aug 2026 - May 2030",
  degree: "B.Comp. in Computer Science (NUS College), Minor in Mathematics",
  gpa: "",
)
- NUS Merit Scholarship.

#edu(
  institution: "Singapore Polytechnic",
  location: "Singapore",
  dates: dates-helper(start-date: "TODO mon", end-date: "TODO mon"),
  degree: "Diploma in Applied AI and Analytics",
  gpa: "4.0/4.0",
)

== Work Experience

#work(
  company: "RAiD, Republic of Singapore Air Force",
  title: "AI Engineer (Volunteer)",
  location: "Singapore",
  dates: dates-helper(start-date: "TODO mon", end-date: "TODO mon"),
)
- Built speech recognition and speaker diarization for Air Traffic Control audio using NVIDIA NeMo and vLLM on H200 GPUs; fine-tuned canary-1b and parakeet-tdt.
- Contributed to a video analytics platform for the RSAF alongside NUS graduate students and NCS engineers.

#work(
  company: "Bifrost AI",
  title: "AI Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "TODO mon", end-date: "TODO mon"),
)
- Trained YOLOv6-lite for ST Engineering's Unmanned Vehicles Team, improving accuracy by 16%+.
- Fine-tuned a StabilityAI VAE for synthetic-to-real domain adaptation.
- Prototyped a data visualization method using JinaCLIP for customers including NASA, BigBear AI and DSTA.

#work(
  company: "GovTech Singapore",
  title: "AI Engineer Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "TODO mon", end-date: "TODO mon"),
)
- Built an end-to-end computer vision pipeline for MSO's OneService App, automating classification of thousands of daily municipal reports.
- Developed real-time animal welfare detection for NParks using OWLv2.
- Red-teamed GovTech's AI Image Detector with custom-trained LoRAs; prototyped an XAI tool using few-shot segmentation.

== Projects

#project(
  name: "Resumify",
  url: "TODO-url",
  dates: dates-helper(start-date: "TODO mon", end-date: "TODO mon"),
)
- Co-founder and AI Lead of a non-profit built with YellowRibbon.gov.sg, HTX, and the Singapore Prison Service; an AI platform helping ex-inmates craft resumes for job placement.
- Secured a \$24,100 grant from the National Youth Council and signed a 12-month MOU with YellowRibbon; featured in Zao Bao.
- Built on Next.js with LLM agents, the OpenAI API, and ElevenLabs.

#project(
  name: "ATC-ASR: fine-tuned parakeet-tdt",
  url: "huggingface.co/qenneth",
  dates: "2025",
)
- Holds state-of-the-art Word Error Rate on the ATC-ASR benchmark with a fine-tuned parakeet-tdt-0.6b-v3.

== Publications

#generic-one-by-two(
  left: [*Crowdsource, Crawl, or Generate? Creating SEA-VL, a Multicultural Vision-Language Dataset for Southeast Asia*],
  right: "ACL 2025",
)
- Co-author (bylined "Kenneth Ko Han Chen") on a 100+ author SEACrowd collaboration; contributed annotated image-caption data to the crowdsourcing track.

== Awards

// NOTE: the blank lines between these are load-bearing. Without a paragraph
// break, consecutive generic-one-by-two calls reflow into a single run-on
// paragraph instead of one line per award.
#generic-one-by-two(
  left: [*Lee Kuan Yew Award* -- Singapore Polytechnic],
  right: "TODO year",
)

#generic-one-by-two(
  left: [*IMDA Gold Medal* -- Infocomm Media Development Authority],
  right: "TODO year",
)

#generic-one-by-two(
  left: [*NUS Merit Scholarship* -- National University of Singapore],
  right: "2026",
)

#generic-one-by-two(
  left: [*Singapore Polytechnic Scholarship*],
  right: "TODO year",
)

#generic-one-by-two(
  left: [*Reply CodeTeen* -- team ranked top 6% globally],
  right: "TODO year",
)

== Skills

*Languages*: Python, C++, JavaScript, SQL \
*AI/ML*: PyTorch, NVIDIA NeMo, OpenCV, YOLO, Grounding DINO, Transformers, LLM agents, LoRA, VAEs \
*Web and Infra*: Next.js, React, Docker, AWS Lambda, GCP, NVIDIA CUDA, MLOps, Git
