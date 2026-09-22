// Content sourced from first-home-playbook-drafts.md (approved drafts).
// Figures here (KiwiSaver, Kāinga Ora thresholds) should be spot-checked
// against kaingaora.govt.nz periodically, per the build brief.

export const DEPOSIT_SOURCES = {
  title: 'Where Your Deposit Can Actually Come From',
  intro: "Most first home buyers assume they need a lump sum of cash sitting in the bank before they can even start looking. In reality, most first home buyers in New Zealand put their deposit together from a mix of sources, not just savings.",
  sections: [
    { heading: 'KiwiSaver withdrawal', body: "If you've been a KiwiSaver member for at least three years, you can generally withdraw your contributions and returns to put towards your first home. You need to leave a minimum of $1,000 in the account. There's no fixed cap on how much you can withdraw, it depends on how much you've contributed and how long you've been a member." },
    { heading: 'Genuine savings', body: "Banks want to see a track record, not just a number. Regular savings built up over time (rather than a lump sum that appeared last month) shows a lender you can manage money and meet repayments." },
    { heading: 'Gifts from family', body: "A deposit gift from a parent or family member is common and generally accepted, as long as it's clearly a gift, not a loan you're expected to repay. Lenders will usually ask for a signed gifting letter." },
    { heading: 'Kāinga Ora First Home Loan', body: "This doesn't give you money for a deposit, but it changes how much deposit you need. If you're eligible, you may be able to buy with as little as 5% deposit instead of the usual 20%, because Kāinga Ora underwrites the difference for the lender." },
    { heading: 'Equity from an existing property', body: "If you already own a property (including with someone else) or a family member is willing to use equity in their own home to help guarantee yours, this can sometimes substitute for cash deposit. This gets more complex and is worth a proper conversation." },
    {
      anchor: 'bank-vs-seller-deposit',
      heading: 'Your deposit to the bank vs your deposit to the seller',
      body: "When you buy a home, you'll hear the word \"deposit\" used for two different things. They're related, but they're not the same, and knowing the difference can make your offer stronger.",
      blocks: [
        { label: 'Your deposit to the bank', body: "This is the total amount you're putting towards the purchase from your own funds, such as savings, KiwiSaver, or a gift from family. The bank uses it to work out how much you need to borrow. For example, a 20% deposit on a $750,000 home is $150,000, and the bank lends the remaining $600,000." },
        { label: 'Your deposit to the seller', body: "This is a payment made to the seller once your offer goes unconditional (or on the day, if you buy at auction). It's usually around 10% of the price, but the amount is agreed in your sale and purchase agreement and can be negotiated. It's held in the agent's trust account before being released to the seller." },
        { label: null, body: "The seller deposit isn't an extra cost. It comes out of your bank deposit, and the rest is paid on settlement day, along with the money from the bank." },
        { label: 'Why the timing matters', body: "Different parts of your deposit become available at different times. Cash savings are usually ready straight away. KiwiSaver funds are applied for through your solicitor, and providers need time to process the withdrawal. That's why many buyers use cash for the seller deposit and put their KiwiSaver towards settlement." },
        { label: null, body: "For example, say your $150,000 deposit is made up of $80,000 in savings and $70,000 in KiwiSaver. You could pay the $75,000 seller deposit from your savings when you go unconditional. Your KiwiSaver and the rest of your savings would then go towards settlement." },
        { label: 'How it can make your offer more attractive', body: "Sometimes a seller needs their deposit quickly, for example to pay the deposit on their own next home. If you can pay the seller deposit promptly from cash, that can make your offer stand out, even against a similar price. If your cash is tight, it's also possible to negotiate a smaller seller deposit." },
        { label: 'Worth knowing', body: "Once you're unconditional, you're committed to the purchase. If a buyer can't settle, the seller deposit can be at risk. Before you agree to any deposit amount or timing, check with your mortgage adviser and solicitor that your funds will be available when they're needed." },
      ],
    },
  ],
  bottomLine: "Most buyers use a combination, KiwiSaver plus savings, or savings plus a family gift, rather than one single source. If you're not sure what you've actually got available, that's exactly what the first conversation with an adviser is for.",
};

export const COSTS_OF_BUYING = {
  title: 'What Buying a Home Actually Costs, Beyond the Deposit',
  intro: "The purchase price and the deposit get all the attention, but there's a second layer of costs that catches a lot of first home buyers off guard. Budgeting for these upfront means no nasty surprises in the final weeks before settlement.",
  sections: [
    { heading: 'Legal fees', body: "You'll need a lawyer or conveyancer to review the sale and purchase agreement, handle the title transfer, and manage settlement. Typically a few thousand dollars, though it varies by firm and complexity." },
    { heading: 'Building report', body: "A qualified building inspector checks the property for structural issues, moisture, and anything else that could cost you later. Usually a few hundred to around a thousand dollars, and genuinely worth it even on a property that looks fine." },
    { heading: 'LIM report (Land Information Memorandum)', body: "This is a report from the local council showing consents, code compliance, rates, and any known issues with the property or land. Usually ordered by your lawyer, and worth the cost for the peace of mind." },
    { heading: 'Valuation', body: "Some lenders require an independent registered valuation of the property before they'll confirm your loan. This is sometimes at your cost, sometimes covered depending on the lender and situation." },
    { heading: 'Moving costs', body: "Removalists, van hire, connecting power and internet, insurance for your new home. Easy to underestimate, especially if you're also carrying moving costs on top of settlement costs in the same week." },
    { heading: 'Ongoing costs from day one', body: "Rates, insurance, and any body corporate or maintenance fees start from settlement day, not from when you feel ready for them. Worth factoring into your monthly budget before you commit, not after." },
  ],
  bottomLine: "Beyond your deposit, a realistic buffer of a few thousand dollars for legal, building, and LIM costs alone is sensible for most purchases. This is exactly the kind of thing to walk through with your adviser before you make an offer, not after.",
};

export const KAINGA_ORA_EXPLAINER = {
  title: 'Kāinga Ora First Home Loan, Explained Simply',
  intro: "You've probably heard the name. Here's what it actually means for you.",
  sections: [
    { heading: 'What it is', body: "A government backed scheme that lets eligible first home buyers purchase with as little as a 5% deposit, instead of the 20% most banks usually require. Kāinga Ora underwrites part of the loan, which is what allows the lender to approve it outside their usual low deposit rules." },
    { heading: "Who it's for", list: [
      'New Zealand citizens, permanent residents, or resident visa holders ordinarily living in New Zealand',
      'First home buyers, or previous owners in a similar financial position to a first home buyer (for example, after a separation)',
      'Buyers who will live in the property themselves, not investors or holiday home buyers',
      'Buyers with at least a 5% deposit',
    ] },
    { heading: 'Income caps (before tax, over the last 12 months)', list: [
      '$95,000 or less for a single buyer with no dependants',
      '$150,000 or less for a single buyer with one or more dependants',
      '$150,000 or less combined for two or more buyers, regardless of dependants',
    ] },
    { heading: "What it isn't", body: "It's not free money and it's not a grant. It's a normal home loan, at normal interest rates, from a participating lender. The only difference is the deposit threshold and how the risk is underwritten. There are also no national house price caps on the First Home Loan currently, though your income and ability to service the loan still need to stack up." },
    { heading: 'A common mix up worth clearing up', body: "The First Home Grant (a cash payment towards your deposit) closed to new applications in May 2024 and is no longer available. The First Home Loan is a separate, still active scheme. If you've seen older content online mentioning a grant alongside the loan, that's outdated." },
  ],
  bottomLine: "If your income fits the caps and you're a genuine first home buyer, this can be the difference between years more saving and buying now. Worth a conversation even if you're not sure you qualify, since eligibility has some nuance the online guides don't always capture.",
};

// Merged glossary (first-home-playbook-journey-brief.md, section 6). Grouped
// under four headings, alphabetical within each group, every term with a
// stable anchor id so other pages (and the journey page) can deep link to
// `/first-home-playbook/glossary#<anchor>`.
export const GLOSSARY_GROUPS = [
  {
    heading: 'Money and lending',
    terms: [
      { term: 'Approval conditions', anchor: 'approval-conditions', body: 'Things the bank needs before it will lend, such as a signed agreement, a valuation or proof of insurance.' },
      { term: 'Asking price', anchor: 'asking-price', body: "The price the seller has advertised. It's their starting point, not a measure of value, and many listings show no price at all." },
      { term: 'Bank deposit', anchor: 'bank-deposit', body: 'The money you put towards the purchase from your own funds (savings, KiwiSaver, family help). The bank uses it to work out your LVR.', readMore: 'deposit-sources' },
      { term: 'Capital value (CV)', anchor: 'capital-value', body: "The council's value of a property for setting rates. In Auckland it's updated every three years, so it can lag behind the market. Also called rateable value (RV) in some councils." },
      { term: 'DTI (debt to income ratio)', anchor: 'dti', body: "How much you owe compared to how much you earn. Lenders use this alongside LVR to assess how much they'll lend you." },
      { term: 'Drawdown', anchor: 'drawdown', body: 'When the bank releases your loan funds, which happens on settlement day.' },
      { term: 'Equity', anchor: 'equity', body: "The difference between what your property is worth and what you still owe on it." },
      { term: 'Fixed rate', anchor: 'fixed-rate', body: 'Your interest rate is locked in for a set period (commonly 6 months to 5 years), so your repayments stay the same during that time regardless of what happens to interest rates generally.' },
      { term: 'Floating rate', anchor: 'floating-rate', body: "Your interest rate can move up or down at any time, usually in line with the lender's floating rate. More flexible, less predictable." },
      { term: 'Genuine savings', anchor: 'genuine-savings', body: "Money you've saved yourself over time, as distinct from a one off deposit into your account, which lenders view differently." },
      { term: 'Kāinga Ora First Home Loan', anchor: 'kainga-ora-first-home-loan', body: 'A government backed scheme that lets eligible buyers borrow with as little as a 5% deposit through participating banks.' },
      { term: 'KiwiSaver first home withdrawal', anchor: 'kiwisaver', body: "Using your KiwiSaver savings towards your first home. You generally need to have been a member for at least three years and must leave $1,000 in the account. Your solicitor applies for it." },
      { term: 'Loan offer', anchor: 'loan-offer', body: "The bank's formal loan documents setting out your interest rate, repayments and terms. You accept it once you're unconditional." },
      { term: 'LVR (loan to value ratio)', anchor: 'lvr', body: "Your loan as a percentage of the property's value. A 20% deposit means an 80% LVR. Borrowing above 80% is possible but harder to get and may cost more." },
      { term: 'Online estimates', anchor: 'online-estimates', body: 'Automated values on sites like homes.co.nz and oneroof.co.nz. Useful for a rough idea, but not reliable enough to base an offer on.' },
      { term: 'Pre-approval', anchor: 'pre-approval', body: "The bank's approval in principle of how much you can borrow, before you've found a property. Usually valid for 3 to 6 months. Not a guarantee, but a strong starting point for house hunting." },
      { term: 'Registered valuation', anchor: 'registered-valuation', body: "An independent report from a registered valuer on a property's market value. Banks often require one for low deposit loans, private sales and some auctions. You pay for it." },
      { term: 'Revolving credit', anchor: 'revolving-credit', body: 'A loan structure that works like a large overdraft against your mortgage, giving flexibility to pay down and redraw funds, generally suited to disciplined budgeters.' },
      { term: 'Seller deposit', anchor: 'seller-deposit', body: "The payment made to the seller when you go unconditional (or on the day at auction), often 10% of the price. It's part of the price, not an extra cost, and it doesn't have to come from the same funds as your bank deposit.", readMore: 'deposit-sources' },
    ],
  },
  {
    heading: 'The property',
    terms: [
      { term: 'Body corporate', anchor: 'body-corporate', body: 'The group of all owners in a unit title development. It manages shared areas, sets levies and rules, and must give you disclosure documents before you buy.' },
      { term: 'Building consent', anchor: 'building-consent', body: 'Council permission needed before certain building work is done.' },
      { term: 'Building inspection (building report)', anchor: 'building-inspection', body: "An independent, mostly visual check of a property's condition by a building inspector. It won't see behind walls or under floors without invasive testing." },
      { term: 'Chattels', anchor: 'chattels', body: 'Items included in the sale, such as the oven, dishwasher, blinds and heat pump. They\'re listed in the agreement.' },
      { term: 'Code Compliance Certificate (CCC)', anchor: 'ccc', body: "The council's confirmation that consented building work was finished to the Building Code." },
      { term: 'Covenant', anchor: 'covenant', body: 'A rule registered on the title that limits what you can do with the property, such as building height or fence style.' },
      { term: 'Cross lease', anchor: 'cross-lease', body: 'You share ownership of the land with other owners and lease your own house from them, usually for 999 years. Alterations often need the other owners\' consent, and the plans on the title must match what\'s built.' },
      { term: 'Easement', anchor: 'easement', body: 'A right for someone else to use part of your land, such as shared driveway access or a drain.' },
      { term: 'Freehold', anchor: 'freehold', body: 'You own the land and the house outright. The simplest and most common title type.' },
      { term: 'Leasehold', anchor: 'leasehold', body: 'You own the house but lease the land, paying ground rent that can rise sharply at review. Get specialist advice before buying.' },
      { term: 'LIM (Land Information Memorandum)', anchor: 'lim', body: "A council report on what it knows about a property: consents, CCCs, zoning, drainage, hazards and rates. It doesn't cover the property's physical condition or work the council doesn't know about." },
      { term: 'Natural hazards', anchor: 'natural-hazards', body: 'Risks like flooding, landslip or coastal erosion. They can affect insurance and lending. Check council hazard maps and the LIM.' },
      { term: 'Record of Title', anchor: 'record-of-title', body: 'The official record held by LINZ showing who owns the property, its legal description, and any easements or covenants.' },
      { term: 'Unconsented work', anchor: 'unconsented-work', body: 'Building work done without a required consent. It can affect insurance, lending and resale value.' },
      { term: 'Unit title', anchor: 'unit-title', body: 'You own your unit and share common property (driveways, gardens, lifts) with other owners through a body corporate. Common for apartments and some townhouses.' },
      { term: 'Vendor report', anchor: 'vendor-report', body: "A building or other report the seller has paid for. Helpful, but it was written for the seller, so check with your solicitor whether you can rely on it." },
      { term: 'Weathertightness', anchor: 'weathertightness', body: 'Whether a building keeps water out. Some homes built roughly between 1994 and 2004, especially with monolithic cladding, carry a higher risk of leaks.' },
    ],
  },
  {
    heading: 'Buying and selling',
    terms: [
      { term: 'Agreement for Sale and Purchase', anchor: 'agreement-for-sale-and-purchase', body: "The standard contract used for most property sales in New Zealand. It sets out the price, deposit, conditions, dates and chattels." },
      { term: 'Auction', anchor: 'auction', body: "Buyers bid publicly and the highest bid above the seller's reserve wins. A winning bid is unconditional, so your homework and finance must be done beforehand." },
      { term: 'Condition (clause)', anchor: 'condition', body: 'Something that must be satisfied before the deal is locked in, such as finance, a building report, LIM or solicitor\'s approval.' },
      { term: 'Conditional', anchor: 'conditional', body: 'You and the seller have signed, but the conditions still need to be satisfied by the agreed dates.' },
      { term: 'Deadline sale', anchor: 'deadline-sale', body: 'Offers are due by a set date and time. The seller can choose to accept an offer earlier.' },
      { term: 'Due diligence', anchor: 'due-diligence', body: 'A broad condition that lets you investigate the property in whatever way you choose within the set days. Sometimes used in place of separate conditions.' },
      { term: 'Multi-offer', anchor: 'multi-offer', body: 'When more than one buyer offers at the same time. You usually get one chance to put forward your best offer.' },
      { term: 'Pre-auction offer', anchor: 'pre-auction-offer', body: 'An offer made before auction day. If the seller is interested, the auction is usually brought forward and your offer becomes the opening bid.' },
      { term: 'Price by negotiation', anchor: 'price-by-negotiation', body: 'No price is advertised. You make an offer and negotiate back and forth with the seller through the agent.' },
      { term: 'Reserve', anchor: 'reserve', body: "The lowest price the seller will accept at auction. It isn't disclosed to buyers." },
      { term: 'Sale and purchase guide', anchor: 'sale-and-purchase-guide', body: 'A plain English guide the agent must give you before you sign an agreement.' },
      { term: 'Tender', anchor: 'tender', body: 'Buyers submit sealed offers by a set date, without seeing other offers.' },
      { term: 'Unconditional', anchor: 'unconditional', body: "All conditions have been satisfied and the contract is binding. You're committed to buying." },
      { term: 'Vendor', anchor: 'vendor', body: 'The seller.' },
      { term: 'Working days', anchor: 'working-days', body: "Days that count towards your condition dates. Weekends, public holidays and a period over Christmas and New Year don't count." },
    ],
  },
  {
    heading: 'Legal and settlement',
    terms: [
      { term: 'Conveyancer', anchor: 'conveyancer', body: 'A licensed professional who handles the legal transfer of property. Similar to a solicitor for a standard purchase.' },
      { term: 'Possession date', anchor: 'possession-date', body: 'The day you get the keys. Usually the same as the settlement date.' },
      { term: 'Pre-settlement inspection', anchor: 'pre-settlement-inspection', body: 'Your chance, usually a day or two before settlement, to check the property and chattels are in the condition agreed.' },
      { term: 'Settlement', anchor: 'settlement', body: 'The day your funds are paid to the seller and ownership transfers to you.' },
      { term: 'Settlement date', anchor: 'settlement-date', body: 'The date agreed in the contract for settlement to happen.' },
      { term: 'Solicitor', anchor: 'solicitor', body: 'Your lawyer for the purchase. Reviews the agreement, manages conditions, handles KiwiSaver and loan documents, and completes settlement.' },
      { term: 'Trust account', anchor: 'trust-account', body: 'A regulated account the agent or solicitor uses to hold money, such as your seller deposit, until it can be released.' },
    ],
  },
];

// Term (as it appears in journey copy) -> glossary anchor, for linking the
// first use of each term on the journey page (brief section 4). Order
// matters a little for readability but not for correctness: word-boundary
// matching means "conditional" never matches inside "unconditional".
export const JOURNEY_GLOSSARY_LINKS = [
  ['Pre-approval', 'pre-approval'],
  ['LIM', 'lim'],
  ['building inspection', 'building-inspection'],
  ['building report', 'building-inspection'],
  ['unit title', 'unit-title'],
  ['body corporate', 'body-corporate'],
  ['weathertightness', 'weathertightness'],
  ['vendor report', 'vendor-report'],
  ['Agreement for Sale and Purchase', 'agreement-for-sale-and-purchase'],
  ['chattels', 'chattels'],
  ['unconditional', 'unconditional'],
  ['conditional', 'conditional'],
  ['registered valuation', 'registered-valuation'],
  ['seller deposit', 'seller-deposit'],
  ['trust account', 'trust-account'],
  ['loan offer', 'loan-offer'],
  ['KiwiSaver', 'kiwisaver'],
  ['settlement', 'settlement'],
  ['pre-settlement inspection', 'pre-settlement-inspection'],
  ['auction', 'auction'],
  ['deadline sale', 'deadline-sale'],
  ['cross lease', 'cross-lease'],
];

// ─── FIRST HOME JOURNEY ──────────────────────────────────────────────────────
// Source: first-home-playbook-journey-brief.md, sections 2.2, 3.1 to 3.5.

export const JOURNEY_INTRO_PARAGRAPHS = [
  "Buying your first home usually takes a few months and involves at least six different people, and knowing the next step before anyone asks you to take it is the best protection you have.",
  "Agents, banks and solicitors do this every day, so it's easy for them to assume you know the process too. This guide walks through each stage in plain English, then shows who does what, so you always know who to call.",
];

export const JOURNEY_RELATED_ROUTES = {
  'Borrow Checker': '/calculator',
  'Deposit Sources': '/deposit-sources',
  'Kāinga Ora explained': '/kainga-ora',
  'Hidden costs': '/costs-of-buying',
  'Glossary': '/glossary',
  'Book a call': '/book-a-call',
  'Are You Ready?': '/are-you-ready',
  'Kāinga Ora Qualifying Quiz': '/kainga-ora-quiz',
};

export const JOURNEY_STAGES_NEGOTIATION = [
  { title: 'Pre-approval', time: '1 to 3 weeks', desc: "Work out what you can borrow and get the bank's approval in principle before you fall in love with a house.", who: ['Mortgage adviser', 'Bank'], todos: ['Book a call with your adviser', 'Gather payslips and bank statements', 'Know where your deposit is coming from'], related: ['Are You Ready?', 'Borrow Checker', 'Deposit Sources', 'Kāinga Ora explained', 'Kāinga Ora Qualifying Quiz'] },
  { title: 'House hunting', time: 'Weeks to months', desc: 'Open homes and viewings. Remember the agent works for the seller.', who: ['Agent'], todos: ['Ask the agent for the property documents', 'Ask about the method of sale', 'Check if the property is in a flood zone with the Auckland Flood Viewer'], related: ['Hidden costs', 'Glossary'] },
  { title: 'Homework', time: '1 to 2 weeks', desc: 'Hand the documents to the experts and check the property is insurable.', who: ['Solicitor', 'Insurer', 'Mortgage adviser'], todos: ['Send documents to your solicitor', 'Check insurability', 'Talk to your adviser about the property'], related: ['Glossary'] },
  { title: 'Making an offer', time: 'A few days', desc: 'Your solicitor reviews the agreement. Make your conditions subject to 10 working days.', who: ['Solicitor', 'Agent', 'Mortgage adviser'], todos: ['Solicitor reviews the agreement', 'Add finance, building and LIM conditions', 'Sign and negotiate'], related: ['Glossary'] },
  { title: 'Conditional period', time: 'Usually 10 working days', desc: 'Work through each condition by its due date. The busiest stage.', who: ['Mortgage adviser', 'Building inspector', 'Valuer', 'Solicitor', 'Insurer'], todos: ['Finance approved', 'Building report reviewed', 'LIM reviewed', 'Insurance quote confirmed'], related: ['Hidden costs'] },
  { title: 'Unconditional', time: '1 day', desc: "The deal is locked in and the seller's deposit is paid.", who: ['Solicitor', 'Agent', 'Mortgage adviser'], todos: ['Pay the seller deposit', 'Finalise loan structure', "Accept the bank's loan offer"], related: ['Deposit Sources'] },
  { title: 'Settlement', time: 'Usually 2 to 8 weeks later', desc: 'Money moves and the house becomes yours. Your solicitor does the heavy lifting.', who: ['Solicitor', 'Bank', 'Insurer'], todos: ['Sign loan documents', 'Apply for KiwiSaver withdrawal', 'Insurance in place from settlement', 'Pre-settlement inspection'], related: ['Hidden costs'] },
  { title: 'Keys', time: 'Settlement day', desc: 'Collect the keys once settlement is confirmed.', who: ['Agent'], todos: ['Set up power and internet', 'Check your first repayment date', 'Book a review with your adviser'], related: ['Book a call'] },
];

export const JOURNEY_STAGES_AUCTION_OVERRIDES = {
  2: { title: 'Homework before auction', time: 'Before auction day', desc: 'Everything must be done before you bid, because a winning bid is unconditional.', who: ['Solicitor', 'Building inspector', 'Insurer', 'Mortgage adviser'], todos: ['Solicitor reviews auction documents', 'Get your own building report', 'Confirm insurance', 'Confirm finance for this property'], related: ['Glossary'] },
  3: { title: 'Auction day', time: 'On the day', desc: "Bid in the room or by phone. If you win, you've bought it.", who: ['Agent', 'Mortgage adviser'], todos: ['Set your top price', 'Register to bid', 'Bring the deposit arrangements'], related: ['Glossary'] },
  4: { title: 'Unconditional on the day', time: 'Same day', desc: "There's no conditional period at auction. The deposit is usually paid on the day.", who: ['Solicitor', 'Agent'], todos: ['Pay the seller deposit', 'Sign the agreement'], related: ['Deposit Sources'] },
  5: { title: 'Finalise the loan', time: 'Before settlement', desc: "We finalise your loan structure and you accept the bank's loan offer.", who: ['Mortgage adviser', 'Bank'], todos: ['Finalise loan structure', "Accept the bank's loan offer"], related: ['Deposit Sources'] },
};

export function journeyStagesForPath(path) {
  if (path !== 'auction') return JOURNEY_STAGES_NEGOTIATION;
  return JOURNEY_STAGES_NEGOTIATION.map((stage, i) => JOURNEY_STAGES_AUCTION_OVERRIDES[i] || stage);
}

// Full "Read more" text, negotiation path only (brief section 3.2). Auction
// variants use their short description instead, per the brief.
export const JOURNEY_FULL_TEXT = [
  {
    heading: '1. Pre-approval',
    paragraphs: ["Pre-approval tells you how much you can borrow before you fall in love with a house. We look at your income, expenses, deposit and debts, then get a bank to approve you in principle."],
    list: [
      'Most pre-approvals last 3 to 6 months, depending on the bank.',
      'They usually come with conditions, such as a satisfactory valuation or insurance on the property.',
      "Your deposit might come from savings, KiwiSaver, family help or a mix. Knowing exactly where it's coming from now saves stress later.",
    ],
  },
  {
    heading: '2. House hunting',
    paragraphs: [
      "This is the fun part, but it helps to remember one thing. The agent works for the seller. They must treat you fairly and honestly, but their job is to get the best result for the seller.",
      'After a viewing you like, ask the agent for:',
    ],
    list: [
      'the property documents (title, LIM if they have one, building report, rates information)',
      "body corporate documents if it's a unit title, such as an apartment or some townhouses",
      'the method of sale and any deadline or auction date',
      'anything the seller has disclosed about the property, such as past weathertightness or consent issues',
    ],
    trailing: ['Expect follow up calls. It\'s fine to say "thanks, we\'re still doing our homework and will come back to you."'],
  },
  {
    heading: '3. Homework on a property',
    paragraphs: ["Before you offer, get a feel for what you'd be buying. You don't need to be an expert, but you do need to know what to hand to the experts."],
    list: [
      'Send the documents to your solicitor for a quick look.',
      'Check the property is insurable. Some insurers restrict cover for flood prone or high hazard areas. In Auckland, the Auckland Flood Viewer shows flood plains and overland flow paths for any address.',
      'Speak with your mortgage adviser about the property. They may have access to property information and can check it fits your approval.',
      'Sites like homes.co.nz and oneroof.co.nz are handy for a rough idea, but treat their estimates with a grain of salt. Agents can sometimes adjust listing information, which can inflate the estimated value.',
      "Decide whether you'll rely on vendor reports or get your own building inspection and LIM.",
    ],
    trailing: ['For an auction, all of this must happen before auction day, because an auction bid is unconditional.'],
    floodViewerLink: true,
  },
  {
    heading: '4. Making an offer',
    paragraphs: ["Most offers are made on the standard Agreement for Sale and Purchase. It's long, but only a handful of pages carry the key details: price, deposit, conditions, dates and chattels."],
    list: [
      'Have your solicitor review the agreement before you sign, especially for your first offer.',
      'Add conditions that protect you, such as finance, building inspection, LIM and solicitor\'s approval.',
      'Talk to your mortgage adviser before you offer. In most cases, the best approach is to make your conditions subject to 10 working days. Those days give everyone enough time to work through the conditional period properly.',
      'If an agent pushes for a quick signature, a short delay to get advice is normal and reasonable.',
    ],
    trailing: ['Once you and the seller have both signed, you have a conditional contract.'],
  },
  {
    heading: '5. The conditional period',
    paragraphs: ["This is when you work through each condition by the agreed date. It's usually the busiest stage."],
    list: [
      'Finance: we send the agreement to the bank and work through the approval conditions, which may include a registered valuation.',
      "Building report: an inspector checks the property and you decide if you're happy.",
      "LIM: the council report is ordered and reviewed, usually with your solicitor.",
      'Insurance: you get a quote and confirm the property can be insured.',
    ],
    trailing: ["If something serious comes up, your solicitor can advise whether to renegotiate or walk away under the conditions."],
  },
  {
    heading: '6. Going unconditional',
    paragraphs: ["When every condition is satisfied, your solicitor confirms this to the seller's solicitor and the deal is locked in."],
    list: [
      "The seller's deposit (often 10% of the price) is usually paid now, into the agent's trust account.",
      'This deposit is separate from the deposit the bank looks at. See the Deposit Sources guide for how they differ.',
      "We finalise your loan structure and repayments, then you accept the bank's formal loan offer.",
    ],
    depositSourcesLink: true,
  },
  {
    heading: '7. Settlement',
    paragraphs: ['Settlement is the day money moves and the house becomes yours. Your solicitor does the heavy lifting.'],
    list: [
      'You sign the loan documents with your solicitor.',
      'KiwiSaver withdrawals are applied for through your solicitor. Allow plenty of time, as providers need several working days to process.',
      'Insurance must be in place from settlement day, and the bank will want proof before releasing funds.',
      'You do a pre-settlement inspection, usually a day or two before, to check the property and chattels are as agreed.',
      'On the day, the bank sends funds to your solicitor, who pays the seller and registers the change of ownership.',
    ],
  },
  {
    heading: '8. Keys and moving in',
    paragraphs: ['The agent releases the keys once the seller\'s solicitor confirms settlement, often in the early afternoon.'],
    list: [
      'Set up power, internet and contents insurance.',
      'Check your first mortgage repayment date.',
      'Book a catch up with us in the first year to review your loan as fixed terms roll over.',
    ],
  },
];

// Backs the "Who's involved" chip popovers on the journey page's stage
// cards (tap a chip to see that person's works-for/does/cost).
export const JOURNEY_WHO_DOES_WHAT = [
  { who: 'Mortgage adviser', worksFor: 'You', does: 'Finds the right bank and loan, gets pre-approval and final approval, helps structure the loan', when: 'Stage 1, then again at offer and unconditional', cost: 'Usually nothing, as advisers are generally paid by the lender (see our disclosure statement)' },
  { who: 'Solicitor or conveyancer', worksFor: 'You', does: 'Reviews the agreement and documents, handles conditions, KiwiSaver withdrawal, loan documents and settlement', when: 'Before your first offer, through to settlement', cost: 'Often around $1,500 to $2,500 for a standard purchase, including disbursements' },
  { who: 'Real estate agent', worksFor: 'The seller', does: 'Markets the property, shares documents, passes offers between you and the seller', when: 'Stage 2 to settlement', cost: 'Nothing, the seller pays their commission' },
  { who: 'Bank (lender)', worksFor: 'Itself', does: 'Lends you the money, sets approval conditions, pays funds on settlement day', when: 'Via your adviser at stages 1, 5 and 7', cost: 'Loan costs are covered in your loan offer' },
  { who: 'Building inspector', worksFor: 'You', does: 'Inspects the property and writes a report on its condition', when: 'Stage 3 or 5', cost: 'Often around $500 to $900, depending on the type and size of property' },
  { who: 'Registered valuer', worksFor: 'Usually the bank', does: 'Gives an independent value of the property, if the bank requires one', when: 'Stage 5', cost: 'Often around $700 to $1,200, paid by you' },
  { who: 'Insurer', worksFor: 'You', does: 'Confirms the property can be insured and issues your house policy', when: 'Stage 3 to check, stage 7 to confirm', cost: 'Your annual premium' },
  { who: 'Council', worksFor: 'Nobody in particular', does: 'Provides the LIM report and holds building consent records', when: 'Stage 3 or 5', cost: 'LIM fees vary by council, typically a few hundred dollars' },
];

export const FLOOD_VIEWER_URL = 'https://experience.arcgis.com/experience/cbde7f2134404f4d90adce5396a0a630';

export const ARE_YOU_READY_QUESTIONS = [
  { q: 'How long have you been thinking about buying your first home?', options: ['Just started looking into it', 'A few months, actively saving', 'Over a year, feeling ready to move'] },
  { q: 'Do you know roughly how much you could borrow?', options: ['No idea yet', "I've used an online calculator", "I've had a conversation with a lender or adviser"] },
  { q: 'Where is your deposit likely to come from?', options: ['Not sure yet', 'Mostly KiwiSaver', 'A mix of savings, KiwiSaver, or family support'] },
  { q: 'Have you spoken to a mortgage adviser before?', options: ['No, never', 'Briefly, a while ago', 'Yes, recently'] },
  { q: "What's your ideal timeframe to buy?", options: ['Just exploring, no rush', 'Within the next 6 to 12 months', 'Ready to move in the next few months'] },
];

export const ARE_YOU_READY_OUTCOMES = {
  starting: {
    title: "You're at the very beginning, and that's a great time to get the fundamentals sorted.",
    body: 'Start with the Know Your Numbers calculator and the guides below to get your bearings. Booking a call is still a great next step whenever you\'re ready.',
  },
  gettingThere: {
    title: "You're closer than you think.",
    body: "If you haven't already, run the calculator to see where you stand. Then book a call to get a clearer picture of your options.",
  },
  ready: {
    title: "Sounds like you're ready for a proper conversation.",
    body: "Let's talk numbers. Book a call with Dan and we'll map out what's possible for you.",
  },
};
