# Choice Properties RAG Demo — Sample Questions

A curated set of questions designed to **make the value of a lease-abstraction RAG chatbot tangible** to Choice Properties stakeholders. Organized by the persona/job-to-be-done so you can target the right person in the room.

The dataset (`choice_properties_synthetic_leases.csv`) is engineered to support every one of these — meaning you can run them live in the demo.

---

## For the Asset Management / Leasing Team

These questions take **hours of paralegal lookup** today. The chatbot returns them in seconds with citations to the exact lease and clause.

1. **"Which leases expire in the next 18 months and have NO renewal options? Sort by annual rent descending."**
   *Why it lands:* Renewal-pipeline triage. Every minute saved here is a deal protected.

2. **"List all Loblaw banner anchor leases in Ontario with rent step-ups in 2027 or 2028, and show me the new PSF rate."**
   *Why it lands:* Forward NOI modelling. Today this is a manual roll-up.

3. **"Find every retail lease where the tenant pays percentage rent with a breakpoint under $1M — these are likely struggling and worth a check-in."**
   *Why it lands:* Tenant health signal hidden in unstructured text.

4. **"Show me leases where the security deposit is less than 2 months of rent AND there's no corporate guarantor AND the tenant category is QSR or Cafe."**
   *Why it lands:* Credit-risk audit. Multi-field reasoning across structured and narrative data.

---

## For Legal & Compliance

This is where the new Dec 2024 Competition Act amendments make RAG urgent — not optional.

5. **"Identify all leases with broad exclusivity clauses that may now be unenforceable under the December 2024 Competition Act amendments. Include the exact clause language."**
   *Why it lands:* Regulatory exposure. Choice's legal team has to do this manually across thousands of leases.

6. **"Which grocery anchor leases have radius restrictions greater than 3 km? Flag the wording for legal review."**
   *Why it lands:* Same regulatory thread, different angle.

7. **"Find leases where the assignment clause grants the tenant the right to assign to 'affiliates or successors' without landlord consent — show me the exact language and the dollar exposure."**
   *Why it lands:* M&A risk. If a tenant gets acquired, who's now on the hook?

8. **"Across all CRU leases in Quebec, summarize the variation in early-termination clause language. Are there any non-standard kick-outs?"**
   *Why it lands:* Surfaces drafting drift across years and law firms — something humans can't do at scale.

---

## For the CFO / Finance

9. **"What's our total annual rent exposure to non-Loblaw tenants in BC, and what percentage of that is from tenants with personal guarantees (vs. corporate covenant)?"**
   *Why it lands:* Risk-weighted revenue view that no GL gives them.

10. **"For all industrial leases with annual fixed escalators, what's the weighted-average escalator rate, and how does that compare to current GTA market (3.0–4.0%)?"**
    *Why it lands:* Reveals leasing spread opportunity on renewals — Choice disclosed +85.6% industrial leasing spreads in 2024 because in-place rents lag market.

11. **"Aggregate total unfunded TI allowance commitments across all leases that commenced in the last 24 months."**
    *Why it lands:* Cash-flow forecasting from clause text.

12. **"Show CAM-cap exposure: list every modified-net lease where the CAM cap is below 4% per year, and quantify how much landlord-borne expense growth that represents annually."**
    *Why it lands:* Hidden P&L drag — this number doesn't exist anywhere except inside the clauses.

---

## For Property Management & Operations

13. **"At Calgary Crossing, who are all the tenants, when does each lease expire, and is anyone in holdover?"**
    *Why it lands:* The classic "rent roll on demand" question — but answered from source documents, not a spreadsheet that someone has to keep updated.

14. **"Which tenants have co-tenancy clauses tied to the anchor going dark, and what's the trigger period (90 days, 180 days, etc.)?"**
    *Why it lands:* Anchor-departure scenario planning across the portfolio.

15. **"Find every lease at a Loblaw-anchored property where a CRU has exclusivity protection — summarize what's protected and for how long."**
    *Why it lands:* Surfaces leasing constraints when filling a vacancy.

---

## The "Wow Moment" Questions

These are the ones to save for last in the demo. They cannot be answered any other way.

16. **"I'm trying to lease 2,400 sf to a new ramen restaurant at our Mississauga property. What restrictions exist in the existing leases at that centre that I need to be aware of?"**
    *Why it lands:* Real leasing-rep workflow. The chatbot reads every existing lease at the property and surfaces the QSR exclusivity, the cafe exclusivity, the radius clauses — all in one answer.

17. **"Compare the renewal language in our top 5 Loblaw leases vs. our top 5 non-Loblaw anchor leases. Where do we have weaker landlord protections?"**
    *Why it lands:* Multi-document synthesis. No human does this in under a week.

18. **"If Shoppers Drug Mart announced tomorrow that they were closing 50 stores nationally, what's our exposure? Show me every Shoppers lease, the remaining term, the co-tenancy rights of other tenants at those properties, and our termination rights."**
    *Why it lands:* This is the question the CEO asks the leasing team during a crisis. Today it takes a war room and a week. The chatbot answers it in 30 seconds during the meeting.

19. **"Generate a one-page lease summary for CHP-LSE-00003 that I can take into a tenant negotiation tomorrow."**
    *Why it lands:* The chatbot writes the brief. The negotiator walks in prepared.

20. **"Which of our leases contain language that hasn't been used in any of our other leases?"**
    *Why it lands:* Anomaly detection in clause language — surfaces bespoke deals that need extra attention. This is pure RAG magic.

---

## How to Run the Demo

1. **Start with #13** — a familiar question that proves the chatbot knows the data.
2. **Go to #5 or #6** — pivot to the legal/regulatory angle. This is where skeptics start nodding.
3. **End with #18** — the crisis scenario. By then, the room is yours.

Total demo time: 15–20 minutes. Cost of *not* doing it: every renewal cycle, every legal review, every M&A diligence runs on humans flipping PDFs.
