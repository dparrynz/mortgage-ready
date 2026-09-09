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

export const GLOSSARY_TERMS = [
  { term: 'LVR (Loan to Value Ratio)', body: "How much you're borrowing compared to the property's value. A 20% deposit means an 80% LVR." },
  { term: 'DTI (Debt to Income ratio)', body: "How much you owe compared to how much you earn. Lenders use this alongside LVR to assess how much they'll lend you." },
  { term: 'Pre-approval', body: "An indication from a lender of how much they're likely to lend you, based on your financial situation, before you've found a specific property. Not a guarantee, but a strong starting point for house hunting." },
  { term: 'Conditional offer', body: "An offer on a property that depends on certain conditions being met (like finance approval, a building report, or a LIM) before it becomes binding." },
  { term: 'Unconditional', body: "Once all the conditions on your offer are satisfied and waived, the agreement becomes unconditional, meaning you're now committed to the purchase." },
  { term: 'Fixed rate', body: "Your interest rate is locked in for a set period (commonly 6 months to 5 years), so your repayments stay the same during that time regardless of what happens to interest rates generally." },
  { term: 'Floating rate', body: "Your interest rate can move up or down at any time, usually in line with the lender's floating rate. More flexible, less predictable." },
  { term: 'Revolving credit', body: "A loan structure that works like a large overdraft against your mortgage, giving flexibility to pay down and redraw funds, generally suited to disciplined budgeters." },
  { term: 'Genuine savings', body: "Money you've saved yourself over time, as distinct from a one off deposit into your account, which lenders view differently." },
  { term: 'Settlement day', body: "The day ownership of the property officially transfers to you and you get the keys." },
  { term: 'Body corporate', body: "Applies to properties like apartments or townhouses that share common areas. Body corporate fees cover the maintenance and insurance of those shared spaces." },
  { term: 'Equity', body: "The difference between what your property is worth and what you still owe on it." },
  { term: 'Sale and purchase agreement', body: "The legal contract between you and the seller setting out the price, settlement date, and any conditions. Once signed by both sides it's binding, subject to any conditions being met." },
  { term: 'Vendor', body: "The person or people selling the property. You'll see this term used throughout the sale and purchase agreement and any correspondence from agents or lawyers." },
  { term: 'Registered valuation', body: "A formal valuation of a property carried out by a registered valuer, distinct from a real estate agent's appraisal. Lenders sometimes require one, particularly for unusual properties or low-deposit lending." },
  { term: 'LIM report', body: "Land Information Memorandum, a report from the local council showing consents, code compliance, rates, and any known issues with the land or property. Usually ordered by your lawyer during due diligence." },
  { term: 'Building report', body: "An independent inspection of a property's structure, moisture levels, and general condition, carried out by a qualified building inspector before you commit to buying." },
  { term: 'Code Compliance Certificate (CCC)', body: "Confirms that building work was completed in line with the consent that was issued for it. Missing CCCs on renovations or additions are a common reason finance gets declined." },
  { term: 'Freehold (fee simple)', body: "The most common form of property ownership in New Zealand. You own the land and buildings outright, with no ongoing lease or ground rent to a separate landowner." },
  { term: 'Leasehold', body: "You own the buildings but not the land, and pay ground rent to whoever owns the land instead. Lending on leasehold property is more restricted, and rent reviews can significantly change your costs over time." },
  { term: 'Cross lease', body: "A form of ownership where two or more owners jointly own the underlying land freehold, and each has a leasehold interest in their own unit. Renovations usually require the other owners' consent and updated legal documents." },
  { term: 'Guarantor', body: "Someone, often a parent, who agrees to be legally responsible for a loan if the borrower can't meet repayments, sometimes by offering equity in their own property as security. A serious commitment worth understanding fully before agreeing to it." },
  { term: 'Low equity margin', body: "An extra charge some lenders add to your interest rate when your deposit is less than 20%, to offset their additional risk. This is separate from, and in addition to, any low equity or low deposit premium some lenders also charge." },
  { term: 'Offset account', body: "A everyday transaction account linked to your mortgage. The balance in it reduces the loan balance interest is calculated on, without actually paying the loan down, so your savings stay accessible." },
  { term: 'Break fee', body: "A charge for paying off or restructuring a fixed rate loan before the fixed term ends. Calculated based on the difference between your fixed rate and current wholesale rates, so it can vary significantly." },
  { term: 'Auction, tender, and deadline sale', body: "Three common ways a property can be sold without a listed asking price. All three usually mean an unconditional offer with no finance or building report clause, so your finance and due diligence need to be sorted before you bid or submit." },
  { term: 'Chattels', body: "Items included in the sale that aren't part of the building itself, like curtains, the stove, or a heat pump. Worth checking the chattels list in the sale and purchase agreement carefully, since it's what's legally included." },
  { term: 'Rateable value (RV) / capital value (CV)', body: "The local council's valuation of a property, used to calculate rates. It's a point-in-time estimate, not a current market valuation, and can differ significantly from what a property actually sells for." },
  { term: 'Serviceability', body: "A lender's assessment of whether your income comfortably covers loan repayments plus living costs and other debts, usually tested at a higher stressed interest rate than what you'll actually pay." },
];

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
