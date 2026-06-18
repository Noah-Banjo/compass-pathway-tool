// Synthetic survivor profiles for demonstration purposes.
// All names, identifying details, and circumstances are entirely fabricated.
// These profiles are designed to represent realistic constraint combinations
// that caseworkers encounter — they do NOT represent real individuals.
// Under no circumstances should this data be used as a template for actual case records.

export const syntheticProfiles = [
  {
    id: "profile-maya",
    label: "Maya, 24 — Seattle metro",
    age: 24,
    region: "Pacific Northwest (Seattle — South King County)",
    educationLevel: "some-high-school",
    educationNote: "Completed 10th grade. Has not obtained GED.",
    employmentGapYears: 5,
    employmentGapExplanation: "Gap is unexplained in survivor's current records. Has expressed willingness to describe as 'family caregiving' in some contexts.",
    workHistoryBefore: "Informal retail work (age 16–17) before exploitation. No formal employment records from that period.",
    criminalRecord: true,
    criminalRecordDetail:
      "Prostitution charge (state-level). Survivor attorney has begun Trafficking Survivors Relief Act process for potential expungement. State-level relief eligibility being assessed.",
    mobilityConstraints: ["no-drivers-license", "limited-transit-access"],
    housingStatus: "stable",
    childrenOrDependents: false,
    traumaWorkplaceSensitivities: [
      "authority-figures",
      "high-surveillance",
      "unpredictable-schedules",
      "male-dominated-environments",
    ],
    statedGoals:
      "Wants stable income, ideally something she can build on. Has expressed interest in helping other women in similar situations eventually. Open to training if it leads somewhere real.",
    supportNetwork: "Active connection with local survivor services org. Regular trauma-informed counseling.",
    counselingSchedule: "Tuesdays and Thursdays, 10am–12pm",
    languagesSpoken: ["English"],
    immigrationStatus: "US Citizen",
    readinessAssessment: "moderate",
    notes:
      "Caseworker notes: Maya is thoughtful and motivated but has had negative experiences with authority-heavy environments. She responds well to choices and autonomy. Record clearing is in process but not complete — any pathway requiring clean record should wait or run parallel.",
  },
  {
    id: "profile-darius",
    label: "Darius, 31 — King County",
    age: 31,
    region: "Pacific Northwest (Seattle metro)",
    educationLevel: "some-college",
    educationNote: "Completed two semesters at community college (general studies) before trafficking situation began.",
    employmentGapYears: 3,
    employmentGapExplanation:
      "Has verifiable construction employment during exploitation period — employer was complicit in trafficking arrangement. This creates a complicated work history: employment exists on paper but conditions were exploitative.",
    workHistoryBefore:
      "Documented construction labor (framing, concrete work) during exploitation. Prior to that, retail and warehouse work. Physical skills are real and documented despite exploitation context.",
    criminalRecord: false,
    criminalRecordDetail: "No criminal record.",
    mobilityConstraints: ["no-drivers-license"],
    housingStatus: "transitional",
    childrenOrDependents: false,
    traumaWorkplaceSensitivities: [
      "authority-figures",
      "wage-theft-history",
      "confined-or-locked-environments",
    ],
    statedGoals:
      "Wants to use his construction skills in a legitimate context where he's paid fairly and has rights. Interested in union work. Open to upskilling. Does not want to start over completely — acknowledges the skills he has, even under exploitation, are real.",
    supportNetwork: "Connected with local labor trafficking survivor services. Has one close family member in the area.",
    counselingSchedule: "Flexible — weekly sessions, scheduling varies",
    languagesSpoken: ["English", "Spanish (conversational)"],
    immigrationStatus: "US Citizen",
    readinessAssessment: "high",
    notes:
      "Caseworker notes: Darius is a strong candidate for trades pathway. Key concern is making sure he understands his rights in unionized environment (contrast with exploitation). Wage theft history means financial literacy piece important. No license is a barrier for some site work.",
  },
  {
    id: "profile-sofia",
    label: "Sofia, 27 — Seattle metro",
    age: 27,
    region: "Pacific Northwest (Renton, WA)",
    educationLevel: "high-school-diploma",
    educationNote: "High school diploma completed before trafficking situation.",
    employmentGapYears: 4,
    employmentGapExplanation: "Gap exists. Can describe as 'caring for family member' which is partially true.",
    workHistoryBefore:
      "Cashier and food service work during high school and one year after. Limited formal history.",
    criminalRecord: false,
    criminalRecordDetail: "No criminal record.",
    mobilityConstraints: ["limited-transit-access"],
    housingStatus: "stable",
    childrenOrDependents: true,
    dependentDetail: "One child, age 4. Childcare available through shelter program for limited hours.",
    traumaWorkplaceSensitivities: [
      "male-dominated-environments",
      "physical-contact",
      "night-shifts",
    ],
    statedGoals:
      "Wants something stable she can do long-term while raising her daughter. Healthcare has come up — she has thought about nursing. Needs schedule flexibility for childcare pickup (school ends at 3pm). Wants to be able to advance over time.",
    supportNetwork:
      "Strong connection with case manager. Child enrolled in local Head Start. Faith community connection.",
    counselingSchedule: "Mondays 1pm. Child therapy Wednesdays 3:30pm.",
    languagesSpoken: ["English", "Spanish (fluent)"],
    immigrationStatus: "US Citizen",
    readinessAssessment: "high",
    notes:
      "Caseworker notes: Sofia is very motivated and stable. The childcare constraint is real — any training or work must accommodate school hours or provide childcare. Night shifts are not viable. Health care interest is genuine. GED is not needed (has diploma). Background check would pass.",
  },
  {
    id: "profile-keisha",
    label: "Keisha, 22 — Tacoma area",
    age: 22,
    region: "Pacific Northwest (Tacoma, Pierce County)",
    educationLevel: "some-high-school",
    educationNote: "Left school in 11th grade. No GED.",
    employmentGapYears: 4,
    employmentGapExplanation: "No formal employment history. Has done informal childcare and housekeeping for extended family.",
    workHistoryBefore: "None formal. Informal care work within family network.",
    criminalRecord: true,
    criminalRecordDetail:
      "Shoplifting charge (misdemeanor, 2 years ago). Prostitution-related charge (currently under review for expungement via state trafficking survivor relief law).",
    mobilityConstraints: ["no-drivers-license", "public-transit-dependent"],
    housingStatus: "transitional",
    childrenOrDependents: false,
    traumaWorkplaceSensitivities: [
      "authority-figures",
      "high-surveillance",
      "chaotic-environments",
      "customer-facing-roles",
    ],
    statedGoals:
      "Expressed interest in beauty and wellness — specifically hair and skincare. Wants something that feels like her own. Has mentioned wanting to eventually have her own clients or small business.",
    supportNetwork:
      "Newly connected with local survivor services. Caseworker relationship is new (3 weeks). No stable family support currently.",
    counselingSchedule: "Twice weekly, times TBD",
    languagesSpoken: ["English"],
    immigrationStatus: "US Citizen",
    readinessAssessment: "moderate-low",
    notes:
      "Caseworker notes: Keisha is in early stabilization. Her interest in beauty/cosmetology is specific and consistent. This is a strength. Readiness for intensive training is moderate — start with orientation and connection before pushing toward enrollment. Criminal records — the shoplifting is minor but prostitution charge needs expungement clarity before any licensed pathway. Cosmetology licensing does not typically exclude misdemeanor records in PA.",
  },
  {
    id: "profile-james",
    label: "James, 38 — Eastern Washington",
    age: 38,
    region: "Pacific Northwest (Yakima, WA — Eastern Washington)",
    educationLevel: "ged",
    educationNote: "GED completed during incarceration on an unrelated charge (now expunged). Can document GED.",
    employmentGapYears: 2,
    employmentGapExplanation: "Gap following exit from trafficking situation (agricultural labor). Has prior formal employment in trucking and warehouse that predates exploitation.",
    workHistoryBefore:
      "Truck driver (6 years, CDL Class A). Warehouse logistics supervisor. Verifiable employment history from before exploitation. CDL expired during exploitation period.",
    criminalRecord: false,
    criminalRecordDetail:
      "Unrelated prior charge expunged. No current record.",
    mobilityConstraints: [],
    housingStatus: "stable",
    childrenOrDependents: true,
    dependentDetail: "Two children, ages 12 and 15, primary custody. Financial pressure is significant.",
    traumaWorkplaceSensitivities: [
      "confined-group-living",
      "forced-collective-work",
    ],
    statedGoals:
      "Wants to return to trucking — it's what he knows and it paid well. Wants to rebuild his CDL (Class A). Also open to logistics management given his warehouse supervisor background. Financial pressure from custody is significant — needs income relatively quickly.",
    supportNetwork:
      "Stable housing, connected to faith community, motivated by children.",
    counselingSchedule: "Biweekly",
    languagesSpoken: ["English"],
    immigrationStatus: "US Citizen",
    readinessAssessment: "high",
    notes:
      "Caseworker notes: James is one of the cleaner cases from a pathway perspective — prior verifiable work history, CDL background, clear goals, no current record, stable housing. Main barriers are CDL renewal and short-term income while requalifying. His agricultural labor trafficking context means physical confined-work settings are a sensitivity, but driving solo is actually preferred.",
  },
];
