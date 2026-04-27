# Choice Properties — Synthetic Lease Dataset Schema

**File:** `choice_properties_synthetic_leases.csv` · 1,000 records · 53 columns

This dataset is **synthetic**, generated for AI prototype demonstration purposes. It is **not** real Choice Properties lease data — but it is calibrated against publicly disclosed portfolio characteristics so the structure, distributions, and clause language read as authentic to anyone familiar with REIT lease abstracts.

---

## Calibration Sources

The data distributions are anchored to public disclosures from:
- [Choice Properties Q3 2025 Quarterly Report](https://www.choicereit.ca/wp-content/uploads/2026/01/Q3-2025-Choice-REIT-Quarterly-Report_EN_AODA.pdf) — 700+ properties, 68.1M sf, $17.8B fair value
- [Choice Properties 2024 Annual Investor Presentation](https://www.choicereit.ca/wp-content/uploads/2025/03/CHP-Investor-Presentation-Q4-2024_Final_AODA.pdf) — asset class breakdown, occupancy 97.6%
- [2016 Loblaw Portfolio Acquisition Disclosure](https://www.newswire.ca/news-releases/choice-properties-real-estate-investment-trust-completes-acquisition-of-portfolio-of-five-properties-from-loblaw-companies-limited-598736331.html) — 15-yr Loblaw lease term, 7.7% step-up every 5 years
- [Aird & Berlis / Soloway Wright commentary on Dec 2024 Competition Act amendments](https://www.airdberlis.com/insights/publications/publication/negotiating-exclusive-use-clauses-following-amendments-to-the-competition-act-(canada)) — exclusivity clause restrictions
- Industry norms from BDC, LoopNet, CoStar, WarehouseIndex on Canadian commercial lease structures

## Portfolio Snapshot (this 1000-lease slice)

| Metric | Value |
|---|---|
| Properties represented | ~165 |
| Asset mix (by lease count) | Retail 84%, Mixed-Use 8%, Industrial 7%, Residential 1% |
| Loblaw banner share (lease count) | ~25% (≈58% by revenue when weighted by GLA — matches CHP disclosure) |
| Geographic mix | ON 49%, QC 24%, AB 9%, BC 10%, balance other |
| Total GLA represented | ~51M sf |
| Total annual base rent | ~$836M |
| Lease status mix | 49% Active · 25% Expired · 20% Holdover · 5% expiring <12 mo · 5% expiring 12-24 mo |

---

## Field Dictionary

### Identifiers & Property
| Field | Type | Description |
|---|---|---|
| `lease_id` | string | Unique lease identifier (CHP-LSE-NNNNN) |
| `property_id` | string | Property identifier (CHP-{ASSET}-NNNN); multiple leases share a property |
| `property_name` | string | Property/centre name |
| `asset_class` | enum | Retail · Industrial · Mixed-Use · Residential |
| `address` | string | Civic address |
| `city` | string | |
| `province` | string | 2-letter Canadian province code |
| `suite_unit` | string | Unit designator (Anchor Premises, Unit A12, etc.) |

### Tenant
| Field | Type | Description |
|---|---|---|
| `tenant_legal_name` | string | Legal entity on the lease |
| `tenant_dba` | string | Operating banner / DBA |
| `tenant_category` | enum | Grocery, Pharmacy, QSR, Cafe, Bank, Fitness, etc. |
| `tenant_role` | enum | Anchor · Junior Anchor · Pad · CRU |
| `is_loblaw_banner` | bool | True for any Loblaw-owned banner (Loblaws, Shoppers, RCSS, No Frills, Maxi, Provigo, Fortinos, Zehrs, Your Independent Grocer, T&T, Wholesale Club, Pharmaprix, Joe Fresh, PC Express) |

### Term & Rent
| Field | Type | Description |
|---|---|---|
| `gla_sqft` | int | Gross leasable area |
| `lease_status` | enum | Active · Expired · Expired (holdover) · Active — expiring <12 months · Active — expiring 12-24 months |
| `commencement_date` | date | |
| `expiry_date` | date | |
| `initial_term_years` | int | |
| `base_rent_psf_year1` | float | $/sf |
| `annual_base_rent_year1` | float | |
| `monthly_base_rent_year1` | float | |
| `rent_escalation_summary` | string | e.g. "Stepped — 7.7% increase every 5 years" |
| `rent_escalation_schedule` | string | Pipe-separated step schedule |

### Recoveries (Additional Rent)
| Field | Type | Description |
|---|---|---|
| `recovery_structure` | enum | Triple Net (NNN) · Modified Net — capped CAM |
| `additional_rent_psf_estimate` | string | TMI/CAM est. $/sf, with CAM cap if applicable |
| `recovery_clause_text` | text | **Narrative clause** — RAG-friendly |

### Percentage Rent
| Field | Type | Description |
|---|---|---|
| `percentage_rent_type` | string | "None" or "X% over natural breakpoint" |
| `percentage_rent_breakpoint` | string | Dollar threshold |
| `percentage_rent_rate` | string | e.g. "5.25%" |
| `percentage_rent_clause_text` | text | **Narrative clause** |

### Renewal Options
| Field | Type | Description |
|---|---|---|
| `renewal_options_count` | int | 0–6 |
| `renewal_option_years_each` | int | Typically 5 |
| `renewal_clause_text` | text | **Narrative clause** |

### Use, Exclusivity, Co-Tenancy, Radius
| Field | Type | Description |
|---|---|---|
| `use_clause_text` | text | **Narrative clause** describing permitted use |
| `exclusivity_type` | enum | None · Limited · Narrow — post-2024 · Broad — pre-2024 (flagged for Competition Act review) |
| `exclusivity_clause_text` | text | **Narrative clause** |
| `co_tenancy_type` | enum | None · Opening · Ongoing |
| `co_tenancy_clause_text` | text | **Narrative clause** |
| `radius_restriction_type` | string | "None" or "X km radius restriction" |
| `radius_restriction_clause_text` | text | **Narrative clause** |

### Assignment / Termination / Security / Guarantor
| Field | Type | Description |
|---|---|---|
| `assignment_subletting_type` | enum | Permitted to affiliates / successors · Consent required, not unreasonably withheld · Restricted |
| `assignment_subletting_clause_text` | text | **Narrative clause** |
| `early_termination_type` | string | None · Tenant termination at year 10 · Kick-out — sales-based |
| `early_termination_clause_text` | text | **Narrative clause** |
| `ti_allowance_summary` | string | e.g. "$25/sf — $746,175 total" or "$0 (as-is)" |
| `ti_allowance_clause_text` | text | **Narrative clause** |
| `security_deposit_summary` | string | e.g. "3 months ($8,801.39)" |
| `security_deposit_clause_text` | text | **Narrative clause** |
| `guarantor` | string | Corporate covenant · Personal guarantee · Indemnity Agreement · None |

### Metadata
| Field | Type | Description |
|---|---|---|
| `anchor_tenant_at_property` | string | Anchor tenant for the centre (for context on co-tenancy) |
| `lease_document_reference` | string | Mock document path |
| `abstracted_by` | string | AI-Auto-v3 · AI-Auto-v3 + Legal QA · Legal Team · Property Mgmt |
| `last_updated` | date | |

---

## Why This Schema Sells the RAG Pitch

Notice that **15 of the 53 fields are narrative `*_clause_text` fields**. This is deliberate. A RAG demo needs to answer the question: *"why not just stick this in a database?"*

The answer: a database can return the **fact** that a lease has an exclusivity clause, but it cannot answer:

- *"Does the language in this clause likely violate the new Competition Act amendments?"*
- *"Across our portfolio, which co-tenancy clauses use the language 'cease operations' versus 'go dark'? Both mean the same thing — but a SQL query won't find them both."*
- *"Find every clause where rent abatement is triggered by anchor closure, regardless of how it's worded."*

That is the wedge. The structured fields prove your model *understands* the lease (so the client trusts the abstraction); the clause text proves the chatbot can answer questions no spreadsheet ever could.

---

## Important Honesty Note for the Client

This dataset was generated synthetically using public information about Choice Properties' portfolio composition and standard Canadian commercial lease structures. **No actual Choice Properties lease was used as input.** The point of the demo is not to show real data — it's to prove that *if* Choice fed their actual leases through the same pipeline, this is the structure and capability they would get. The demo unblocks their imagination; the production system runs on their real documents.
