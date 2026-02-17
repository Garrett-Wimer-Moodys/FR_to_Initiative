**Problem Statement**
- Missing or incorrect linkage of the new DRP Salesforce Opportunity ID (OPID) to ratings in legacy NRD (instrument/program/org) causes CPQ quote updates and invoicing to be wrong or incomplete. Current handover and reconciliation are manual, leading to gaps post-dissemination and downstream billing errors.

**Current Limitations**
- Manual handover email contains legacy OPID; not consistently updated to the new DRP OPID.
- APX team performs post-dissemination reconciliation; timing and SLAs are not formalized.
- No pre-CPQ control gate to block quote refresh when any rating in the transaction lacks OPID.
- Gravity acts as distributor but lacks consumer-specific checks for OPID presence; feedback loop from NRD → Gravity → Salesforce is not defined.
- Ratings packages may be unevenly linked (some items have OPID, others do not).

**Benefits**
- Accurate, complete CPQ updates and invoices for non-DRP Billing Toggle flows.
- Reduced manual rework and fewer invoice adjustments.
- Clear audit trail and ownership for OPID data quality.
- Faster time-to-invoice with fewer blockers.

**Impacted Personas**
- **APX Control Team:** Performs reconciliation for missing/mismatched OPIDs.
- **GMO Operations:** Enters OPID during setup; links ratings to the correct opportunity.
- **Ratings Analysts / Ratings Desk:** Approve dissemination; source transaction context.
- **Commercial RM / Sales:** Own the opportunity; review/approve updated quotes.
- **Billing Team:** Approves invoice; ensures BAU billing accuracy.
- **CPQ Admins:** Configure controls and automation for quote refresh gates.
- **AU Team:** Assignment as part of eligibility context and customer handling.
- **Gravity/Data Engineering:** Eventing, cadence, and consumer checks for OPID.

**Persona**
- **APX Control Team**

**Description**
- Reconciles ratings missing DRP OPID post-dissemination; updates NRD and confirms propagation to Gravity.

**Feature Set**
- **Handover Update:** Include the new DRP Salesforce OPID in the handover email (replace legacy OPID).
- **APX Reconciliation:** Define SLA to identify/fix missing OPIDs post-dissemination; publish daily exception list.
- **Pre-CPQ Gate:** Block quote refresh if any rating in the transaction lacks OPID; alert owner with exception details.
- **Feedback Loop:** NRD fix propagates to Gravity (hourly feed) and then to Salesforce; retry processing on resolution.
- **Exception Reporting:** Dashboard on OPID completeness and open exceptions by transaction/opportunity.

**Success Criteria**
- **OPID Integrity:** 0 quotes updated when any transaction item lacks OPID (gate always holds).
- **Linkage Timeliness:** ≥ 99% ratings linked to OPID within 24h of dissemination (—).
- **Propagation Latency:** Gravity→Salesforce lag ≤ 60 minutes for corrected OPIDs (—).
- **Invoice Accuracy:** Invoice adjustments due to OPID issues reduced by ≥ 80% (—).
- **Alert Response:** Exceptions acknowledged within 4 business hours; resolved within 1 business day (—).