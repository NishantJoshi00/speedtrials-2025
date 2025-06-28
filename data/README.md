# Data

**Across 10 CSV files, this directory includes a full Q1 2025 export of the SDWIS for the state of Georgia.** 

This README includes information on the File Structure, a Data Dictionary, as well as some (potentially) helpful external links at the bottom. 

---

## 💾 About the SDWIS
The Safe Drinking Water Information System (SDWIS) contains information on public water systems, including monitoring, enforcement, and violation data related to requirements established by the Safe Drinking Water Act (SDWA). 

---

## 🗄️ File Structure
Key fields for each table are listed in bold below. Key fields uniquely identify the records within each file, and may be used to join and relate data between files.

For example, in the SDWA_PUB_WATER_SYSTEMS.csv file, each row describes a public water system in a particular quarter, and is uniquely identified by the values of the key fields SUBMISSIONYEARQUARTER and PWSID. Site visits, violations, and so on for that same system and quarter are identified by the same values of SUBMISSIONYEARQUARTER and PWSID in the other files.

### Events and Milestones (SDWA_EVENTS_MILESTONES.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the quarterly SDWIS snapshot. |
| **PWSID** | Char | 9 | Unique public-water-system ID: two-letter state/region code + seven digits. |
| **EVENT_SCHEDULE_ID** | Char | 20 | Identifier for milestone events. |
| EVENT_END_DATE | Date | — | Date the milestone event ended (MM/DD/YYYY). |
| EVENT_ACTUAL_DATE | Date | — | Date the milestone was conducted or achieved (MM/DD/YYYY). |
| EVENT_COMMENTS_TEXT | Char | 2000 | Description of the milestone event. |
| EVENT_MILESTONE_CODE | Char | 4 | Four-character milestone code:<br>DEEM – System deemed optimized without OCCT<br>DONE – System done with OCCT<br>LSLR – Lead service line replacement required<br>FICF – Fecal Indicator Contamination Action<br>SDFF – Significant Deficiency/Sanitary Defect Corrective Action<br>SDFI – Significant Deficiency/Sanitary Defect Interim Step<br>FICI – Fecal Indicator Interim Step<br>RTL1 – Revised Total Coliform Rule Level 1 Trigger<br>RTL2 – Revised Total Coliform Rule Level 2 Trigger |
| EVENT_REASON_CODE | Char | 4 | Reason code:<br>B1 – Serving &lt; 50 000<br>B3 – Serving &gt; 50 000; met action levels<br>WQP – Water-quality parameters<br>GW – Ground Water Rule<br>SH – Subpart H (Interim Enhanced SWTR)<br>L2TA – MCL Treatment Technique Trigger<br>L2TB – Second Level 1 Treatment Technique Trigger<br>L1TC – Level 1 Coliform Positive Insufficient Repeat Trigger<br>L1TD – Level 1 Multiple Total Coliform Positive Trigger<br>RTCR – Revised Total Coliform Rule |
| FIRST_REPORTED_DATE | Date | — | First reported date for the milestone (MM/DD/YYYY). |
| LAST_REPORTED_DATE | Date | — | Last reported date for the milestone (MM/DD/YYYY). |

### Facilities (SDWA\_FACILITIES.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| **FACILITY_ID** | Char | 12 | Uniquely identifies a water-system facility (with PWSID). |
| FACILITY_NAME | Char | 100 | Name of the facility. |
| STATE_FACILITY_ID | Char | 40 | Facility ID used in the state’s own database. |
| FACILITY_ACTIVITY_CODE | Char | 1 | Status code:<br>A – Active<br>I – Inactive<br>N – Became non-public<br>M – Merged with another system<br>P – Future system to be regulated |
| FACILITY_DEACTIVATION_DATE | Date | — | Date facility stopped meeting SDWA criteria or ceased service (MM/DD/YYYY). |
| FACILITY_TYPE_CODE | Char | 4 | Facility type:<br>CC – Consecutive Connection<br>CH – Common Headers<br>CS – Cistern<br>CW – Clear Well<br>DS – Distribution System/Zone<br>IG – Infiltration Gallery<br>IN – Intake<br>NN – Non-piped, Non-purchased<br>NP – Non-piped<br>OT – Other<br>PC – Pressure Control<br>PF – Pump Facility<br>RC – Roof Catchment<br>RS – Reservoir<br>SI – Surface Impoundment<br>SP – Spring<br>SS – Sampling Station<br>ST – Storage<br>TM – Transmission Main<br>TP – Treatment Plant<br>WH – Wellhead<br>WL – Well |
| SUBMISSION_STATUS_CODE | Char | 4 | Inventory-submission status:<br>Y – Reported & accepted<br>U – Unreported<br>R – Reported but rejected |
| IS_SOURCE_IND | Char | 1 | “Y” if facility is a source (CC, IG, IN, NP, RC, RS, SP, WL, NN). |
| WATER_TYPE_CODE | Char | 4 | Source type: GW (ground), SW (surface), GU (ground under influence). |
| AVAILABILITY_CODE | Char | 4 | Utilization:<br>E – Emergency<br>I – Interim<br>P – Permanent<br>O – Other<br>S – Seasonal<br>U – Unknown |
| SELLER_TREATMENT_CODE | Char | 4 | Treatment by seller (source facilities only):<br>F – Filtered<br>G – Fully treated (incl. 4-log GWR)<br>Y – Partially treated<br>N – Not treated<br>U – Unknown |
| SELLER_PWSID | Char | 9 | PWSID of the water system selling water through this interconnection. |
| SELLER_PWS_NAME | Char | 100 | Name of the selling (upstream) water system. |
| FILTRATION_STATUS_CODE | Char | 4 | Filtration status:<br>MIF – Must install filtration<br>SAF – Successfully avoiding filtration<br>FIL – Filtration in place |
| IS_SOURCE_TREATED_IND | Char | 1 | Indicates if source water is treated (Y/N). |
| FIRST_REPORTED_DATE | Date | — | First reported date for the facility (MM/DD/YYYY). |
| LAST_REPORTED_DATE | Date | — | Last reported date for the facility (MM/DD/YYYY). |

### Geographic Areas (SDWA\_GEOGRAPHIC\_AREAS.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| **GEO_ID** | Char | 20 | System-generated ID that uniquely pairs a PWSID with an area type. |
| **AREA_TYPE_CODE** | Char | 4 | Area type:<br>TR – Tribal<br>CN – County<br>ZC – Zip Code<br>CT – City<br>IR – Indian Reservation<br>NULL – Unknown |
| TRIBAL_CODE | Char | 10 | EPA code for the reservation or Alaska Remote Village served (see SDWA_REF_CODE_VALUES.csv). |
| STATE_SERVED | Char | 4 | State served by the facility. |
| ANSI_ENTITY_CODE | Char | 4 | ANSI code for county/city/legal area (paired with ANSI state code). |
| ZIP_CODE_SERVED | Char | 5 | Five-digit ZIP code served. |
| CITY_SERVED | Char | 40 | City served. |
| COUNTY_SERVED | Char | 40 | County served. |
| LAST_REPORTED_DATE | Date | — | Last reported date (MM/DD/YYYY). |

### Lead and Copper Rule (SDWA\_LCR\_Samples.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| **SAMPLE_ID** | Char | 20 | Identifier for the sample. |
| SAMPLING_END_DATE | Date | — | Last day of the monitoring period for 90th-percentile lead/copper data (MM/DD/YYYY). |
| SAMPLING_START_DATE | Date | — | First day of the monitoring period for 90th-percentile lead/copper data (MM/DD/YYYY). |
| RECONCILIATION_ID | Char | 40 | ID used to reconcile with state or lab identifiers. |
| SAMPLE_FIRST_REPORTED_DATE | Date | — | First reported date of the sample result (MM/DD/YYYY). |
| SAMPLE_LAST_REPORTED_DATE | Date | — | Last reported date of the sample result (MM/DD/YYYY). |
| **SAR_ID** | Num | 9 | System-generated ID that uniquely identifies each Sample Result record. |
| CONTAMINANT_CODE | Char | 4 | Code for the contaminant (see SDWA_REF_CODE_VALUES.csv). |
| RESULT_SIGN_CODE | Char | 1 | Indicates relation to detection limit:<br>L – Less than (below MDL)<br>E – Equal to (exact value) |
| SAMPLE_MEASURE | Num | — | Measured contaminant value. |
| UNIT_OF_MEASURE | Char | 4 | Units of SAMPLE_MEASURE. |
| SAR_FIRST_REPORTED_DATE | Date | — | First reported date of the sample analytical result (MM/DD/YYYY). |
| SAR_LAST_REPORTED_DATE | Date | — | Last reported date of the sample analytical result (MM/DD/YYYY). |

### Public Notice Violations (SDWA\_PN\_VIOLATION\_ASSOC.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| **PN_VIOLATION_ID** | Char | 20 | Unique identifier for the public-notification violation. |
| RELATED_VIOLATION_ID | Char | 20 | Violation ID associated with this public notification. |
| NON_COMPL_PER_BEGIN_DATE | Date | — | Begin date of the non-compliance period (MM/DD/YYYY). |
| NON_COMPL_PER_END_DATE | Date | — | End date of the non-compliance period (MM/DD/YYYY). Null for unresolved violations or when enforcement continues. |
| VIOLATION_CODE | Char | 4 | Violation code (see SDWA_REF_CODE_VALUES.csv). |
| CONTAMINATION_CODE | Char | 4 | Contaminant code (see SDWA_REF_CODE_VALUES.csv). |
| FIRST_REPORTED_DATE | Date | — | First reported date for the violation (MM/DD/YYYY). |
| LAST_REPORTED_DATE | Date | — | Last reported date for the violation (MM/DD/YYYY). |

### Public Water Systems (SDWA\_PUB\_WATER\_SYSTEMS.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| PWS_NAME | Char | 100 | Name of the public water system. |
| PRIMACY_AGENCY_CODE | Char | 2 | Two-character state code or EPA region with primacy. |
| EPA_REGION | Char | 2 | EPA region in which the system is located. |
| SEASON_BEGIN_DATE | Char | 5 | Opening day/month for seasonal systems (DD-MON). |
| SEASON_END_DATE | Char | 5 | Closing day/month for seasonal systems (DD-MON). |
| PWS_ACTIVITY_CODE | Char | 1 | System status:<br>A – Active&nbsp;&nbsp;I – Inactive&nbsp;&nbsp;N – Now non-public<br>M – Merged&nbsp;&nbsp;P – Future regulated |
| PWS_DEACTIVATION_DATE | Date | 7 | Date system closed/deactivated (MM/DD/YYYY). |
| PWS_TYPE_CODE | Char | 6 | System type:<br>CWS – Community<br>TNCWS – Transient non-community<br>NTNCWS – Non-transient non-community |
| DBPR_SCHEDULE_CAT_CODE | Char | 6 | Stage 2 DBP schedule (1–4 by population/connection size). |
| CDS_ID | Char | 100 | Combined distribution-system ID. |
| GW_SW_CODE | Char | 2 | Source type: GW or SW (blank if purchased). |
| LT2_SCHEDULE_CAT_CODE | Char | 6 | LT2 schedule: 1–5. |
| OWNER_TYPE_CODE | Char | 1 | Ownership:<br>F – Federal&nbsp;L – Local&nbsp;M – Public/Private<br>N – Native American&nbsp;P – Private&nbsp;S – State |
| POPULATION_SERVED_COUNT | Num | — | Average daily population served. |
| POP_CAT_2_CODE | Char | 2 | Pop. size:<br>1 – &lt;10 000<br>2 – 10 000+ |
| POP_CAT_3_CODE | Char | 2 | Pop. size:<br>1 – ≤3 300<br>2 – 3 301-50 000<br>3 – &gt;50 000 |
| POP_CAT_4_CODE | Char | 2 | Pop. size:<br>1 – &lt;10 000<br>2 – 10 000-49 999<br>3 – 50 000-99 999<br>4 – 100 000+ |
| POP_CAT_5_CODE | Char | 2 | Pop. size:<br>1 – ≤500<br>2 – 501-3 300<br>3 – 3 301-10 000<br>4 – 10 001-100 000<br>5 – &gt;100 000 |
| POP_CAT_11_CODE | Char | 2 | Pop. size categories 1–11 (≤100 up to &gt;1 000 000). |
| PRIMACY_TYPE | Char | 20 | Indicates state, tribal, territorial, or EPA primacy. |
| PRIMARY_SOURCE_CODE | Char | 4 | Primary source:<br>GW, GWP, SW, SWP, GU, GUP |
| IS_GRANT_ELIGIBLE_IND | Char | 1 | Y/N – reported data supports grant eligibility. |
| IS_WHOLESALER_IND | Char | 1 | Y/N – system wholesales water. |
| IS_SCHOOL_OR_DAYCARE_IND | Char | 1 | Y/N – primary service area is a school/daycare. |
| SERVICE_CONNECTIONS_COUNT | Num | — | Number of service connections. |
| SUBMISSION_STATUS_CODE | Char | 1 | Inventory status:<br>Y – Accepted&nbsp;U – Unreported&nbsp;R – Rejected |
| ORG_NAME | Char | 100 | Legal-entity organization name. |
| ADMIN_NAME | Char | 100 | Administrative contact name. |
| EMAIL_ADDR | Char | 100 | Administrative contact email. |
| PHONE_NUMBER | Char | 15 | Primary phone (NNN) NNN-NNNN. |
| PHONE_EXT_NUMBER | Char | 5 | Phone extension. |
| FAX_NUMBER | Char | 15 | Fax number. |
| ALT_PHONE_NUMBER | Char | 15 | Alternate phone number. |
| ADDRESS_LINE1 | Char | 200 | Address line 1. |
| ADDRESS_LINE2 | Char | 200 | Address line 2 (street/RR/etc.). |
| CITY_NAME | Char | 40 | City of the entity. |
| ZIP_CODE | Char | 14 | ZIP or ZIP+4 (ZZZZZEEEE). |
| COUNTRY_CODE | Char | 2 | Two-letter country code. |
| FIRST_REPORTED_DATE | Date | 7 | First reported date (MM/DD/YYYY). |
| LAST_REPORTED_DATE | Date | 7 | Last reported date (MM/DD/YYYY). |
| STATE_CODE | Char | 2 | USPS state abbreviation. |
| SOURCE_WATER_PROTECTION_CODE | Char | 2 | Indicates implementation of source-water protection. |
| SOURCE_PROTECTION_BEGIN_DATE | Date | 7 | Date protection implemented (MM/DD/YYYY). |
| OUTSTANDING_PERFORMER | Char | 2 | Indicates outstanding performer status. |
| OUTSTANDING_PERFORM_BEGIN_DATE | Date | 7 | Date status achieved (MM/DD/YYYY). |
| REDUCED_RTCR_MONITORING | Char | 20 | RTCR monitoring frequency (annual, quarterly, etc.). |
| REDUCED_MONITORING_BEGIN_DATE | Date | 7 | Date reduced monitoring began (MM/DD/YYYY). |
| REDUCED_MONITORING_END_DATE | Date | 7 | Date reduced monitoring ended (MM/DD/YYYY). |
| SEASONAL_STARTUP_SYSTEM | Char | 40 | Indicates off-season pressurization practice for seasonal systems. |

### ANSI (SDWA\_REF\_ANSI\_AREAS.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **ANSI_STATE_CODE** | Char | 2 | ANSI state code for facility location (see SDWA_REF_ANSI_AREAS.csv and U.S. Census ANSI list). |
| **ANSI_ENTITY_CODE** | Char | 3 | ANSI code for county, city, or legal statistical area (paired with state code to uniquely identify the area). |
| ANSI_NAME | Char | 40 | Name of the area associated with the ANSI codes. |
| STATE_CODE | Char | 2 | USPS state abbreviation where the entity is located. |

### Reference Codes (SDWA\_REF\_CODE\_VALUES.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **VALUE_TYPE** | Char | 40 | Column name associated with the value code (see other files). |
| **VALUE_CODE** | Char | 40 | Value associated with the column named in VALUE_TYPE. |
| VALUE_DESCRIPTION | Char | 250 | Description of the value in VALUE_CODE. |

### Service Areas (SDWA\_SERVICE\_AREAS.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| SERVICE_AREA_TYPE_CODE | Char | 4 | Service-area type (see SDWA_REF_CODE_VALUES.csv, VALUE_TYPE = SERVICE_AREA_CODE). |
| IS_PRIMARY_SERVICE_AREA_CODE | Char | 1 | Y/N — indicates whether this is the system’s primary service area. |
| FIRST_REPORTED_DATE | Date | — | First reported date of the service area (MM/DD/YYYY). |
| LAST_REPORTED_DATE | Date | — | Last reported date of the service area (MM/DD/YYYY). |

### Site Visits (SDWA\_SITE\_VISITS.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| **VISIT_ID** | Char | 20 | Identification number of the site visit. |
| VISIT_DATE | Date | — | Date of the visit (MM/DD/YYYY). |
| AGENCY_TYPE_CODE | Char | 2 | Agency that conducted the visit:<br>NULL – Unknown&nbsp;&nbsp;AR – Alaskan Remote Village&nbsp;&nbsp;AT – Authority&nbsp;&nbsp;BR – Borough&nbsp;&nbsp;CM – Commission&nbsp;&nbsp;CN – County&nbsp;&nbsp;CT – City&nbsp;&nbsp;DS – District&nbsp;&nbsp;FD – Federal&nbsp;&nbsp;MN – Municipality&nbsp;&nbsp;NA – Native American Tribe&nbsp;&nbsp;PR – Parish&nbsp;&nbsp;RG – Region&nbsp;&nbsp;SA – State Admin. District&nbsp;&nbsp;SD – School District&nbsp;&nbsp;SR – State Admin. Region&nbsp;&nbsp;ST – State&nbsp;&nbsp;TW – Town&nbsp;&nbsp;WD – Water District&nbsp;&nbsp;SC – State Contractor&nbsp;&nbsp;TA – Non-State Provider&nbsp;&nbsp;WS – Water System |
| VISIT_REASON_CODE | Char | 4 | Reason for the visit (see SDWA_REF_CODE_VALUES.csv, VALUE_TYPE = VISIT_REASON_CODE). |
| MANAGEMENT_OPS_EVAL_CODE | Char | 1 | Management/operations result:<br>M – Minor&nbsp;&nbsp;N – None&nbsp;&nbsp;R – Recommendations&nbsp;&nbsp;S – Significant&nbsp;&nbsp;X – Not evaluated&nbsp;&nbsp;Z – Not applicable&nbsp;&nbsp;D – Sanitary defect |
| SOURCE_WATER_EVAL_CODE | Char | 1 | Source-water result (codes as above). |
| SECURITY_EVAL_CODE | Char | 1 | Security result (codes as above). |
| PUMPS_EVAL_CODE | Char | 1 | Pumps result (codes as above). |
| OTHER_EVAL_CODE | Char | 1 | Other equipment/management result (codes as above). |
| COMPLIANCE_EVAL_CODE | Char | 1 | Compliance result (codes as above). |
| DATA_VERIFICATION_EVAL_CODE | Char | 1 | Data-verification result (codes as above). |
| TREATMENT_EVAL_CODE | Char | 1 | Treatment result (codes as above). |
| FINISHED_WATER_STOR_EVAL_CODE | Char | 1 | Finished-water storage result (codes as above). |
| DISTRIBUTION_EVAL_CODE | Char | 1 | Distribution-system result (codes as above). |
| FINANCIAL_EVAL_CODE | Char | 1 | Financial result (codes as above). |
| VISIT_COMMENTS | Char | 2000 | Visitor comments. |
| FIRST_REPORTED_DATE | Date | — | First reported date of the visit (MM/DD/YYYY). |
| LAST_REPORTED_DATE | Date | — | Last reported date of the visit (MM/DD/YYYY). |

### Violations and Enforcement (SDWA\_VIOLATIONS\_ENFORCEMENT.csv)
| Element | Data Type | Length | Element Definition |
| --- | --- | --- | --- |
| **SUBMISSIONYEARQUARTER** | Char | 7 | Fiscal year + quarter of the SDWIS snapshot. |
| **PWSID** | Char | 9 | Two-letter state/region code + seven-digit public-water-system ID. |
| **VIOLATION_ID** | Char | 20 | System-generated identifier for a violation. |
| FACILITY_ID | Char | 12 | Facility ID (with PWSID) uniquely identifying the facility. |
| NON_COMPL_PER_BEGIN_DATE | Date | — | Begin date of the non-compliance period (MM/DD/YYYY). |
| NON_COMPL_PER_END_DATE | Date | — | End date of the non-compliance period (MM/DD/YYYY) – null if unresolved. |
| VIOLATION_CODE | Char | 4 | Violation code (see SDWA_REF_CODE_VALUES.csv). |
| VIOLATION_CATEGORY_CODE | Char | 5 | Category: TT, MRDL, Other, MCL, MR, MON, RPT. |
| IS_HEALTH_BASED_IND | Char | 1 | Y/N – health-based (MCL, MRDL, or treatment-technique) violation. |
| CONTAMINANT_CODE | Char | 4 | Code for the contaminant involved (see SDWA_REF_CODE_VALUES.csv). |
| VIOL_MEASURE | Num | — | Analytical result that exceeded the standard. |
| UNIT_OF_MEASURE | Char | 9 | Units of VIOL_MEASURE. |
| FEDERAL_MCL | Char | 31 | Federal MCL that was exceeded. |
| STATE_MCL | Num | — | State MCL that was exceeded. |
| IS_MAJOR_VIOL_IND | Char | 1 | Y/N – Monitoring & Reporting violation is major. |
| SEVERITY_IND_CNT | Num | — | Severity count for certain DBPR/IESWTR violations. |
| CALCULATED_RTC_DATE | Date | — | Date the system returned to compliance. |
| VIOLATION_STATUS | Char | 11 | Resolved / Archived / Addressed / Unaddressed (see definition). |
| PUBLIC_NOTIFICATION_TIER | Num | — | Public-notification tier. |
| CALCULATED_PUB_NOTIF_TIER | Num | — | Calculated notification tier. |
| VIOL_ORIGINATOR_CODE | Char | 4 | Initiated by: F-ODSWEB, H-HQ, R-Region, S-State. |
| SAMPLE_RESULT_ID | Char | 40 | ID linking to the sample result record. |
| CORRECTIVE_ACTION_ID | Char | 40 | Corrective-action identifier. |
| RULE_CODE | Char | 3 | National Drinking Water Rule code (e.g., 110, 121, 350). |
| RULE_GROUP_CODE | Char | 3 | Rule-group code (e.g., 120, 220, 330). |
| RULE_FAMILY_CODE | Char | 3 | Rule family: 100, 200, 300, 400, 500. |
| VIOL_FIRST_REPORTED_DATE | Date | — | First reported date (MM/DD/YYYY). |
| VIOL_LAST_REPORTED_DATE | Date | — | Last reported date (MM/DD/YYYY). |
| ENFORCEMENT_ID | Char | 20 | Identifier for the enforcement action occurrence. |
| ENFORCEMENT_DATE | Date | — | Date of the enforcement action (MM/DD/YYYY). |
| ENFORCEMENT_ACTION_TYPE_CODE | Char | 4 | Enforcement-action type (see SDWA_REF_CODE_VALUES.csv). |
| ENF_ACTION_CATEGORY | Char | 4000 | Formal / Informal / Resolving enforcement category. |
| ENF_ORIGINATOR_CODE | Char | 4 | Action by: F, H, R, or S. |
| ENF_FIRST_REPORTED_DATE | Date | — | First reported date of the enforcement (MM/DD/YYYY). |
| ENF_LAST_REPORTED_DATE | Date | — | Last reported date of the enforcement (MM/DD/YYYY). |

---

## 📘 Data Element Dictionary
The following is a list of the data elements and SDWIS-derived elements that appear in the ECHO SDWA download. The data elements are listed alphabetically by data element name.

**ADMIN\_NAME** \- Name of the water system administrative contact – usually a person’s name.

**ADDRESS\_LINE1** \- The first line of an address applicable to a legal entity.

**ADDRESS\_LINE2** \- The second line of an address applicable to a legal entity. This field is the street address, rural route, etc.

**ALT\_PHONE\_NUMBER** \- Administrative contact's alternative telephone number.

**AREA\_TYPE\_CODE** \- Code identifying the area type where the facility is located.

-   TR - Tribal
-   CN - County
-   ZC - Zip Code
-   CT - City
-   IR - Indian Reservation
-   NULL - Unknown Area Type

**AVAILABILITY\_CODE** \- A single-character code for how the water source is utilized by a water system.

-   E - Emergency
-   I - Interim
-   P - Permanent
-   O - Other
-   S - Seasonal
-   U - Unknown

**Address (Cities Served, State, State Name, and State Code)** \- City(ies) and state(s) where the system provides drinking water. In some cases, the address may indicate the mailing address of the system owner. For systems in Indian Country, the state is the state primarily served by the system, if EPA can determine that from available locational data, or else the mailing address state of the system owner. Note: Data on areas served may be incomplete and have not been quality assured.

**AGENCY** \- A code representing the agency responsible for issuing the enforcement action. Valid values are “E” (EPA), or “S” (State).

**AGENCY\_TYPE\_CODE** \- The agency type that conducted the site visit.

-   NULL- Unknown Agency Type
-   AR- Alaskan Remote Village
-   AT- Authority
-   BR- Borough
-   CM- Commission
-   CN- County
-   CT- City
-   DS- District
-   FD- Federal
-   MN- Municipality
-   NA- Native American Tribe
-   PR- Parish
-   RG- Region
-   SA- State Administrative District
-   SD- School District
-   SR- State Administrative Region
-   ST- State
-   TW- Town
-   WD- Water District
-   SC- State Contractor
-   TA- Non-State Provider Engineering/Technical Assistance Firm
-   WS- Water System

**ANSI\_ENTITY\_CODE** \- American National Standards Institute (ANSI) code for the county, city, or legal statistical area. Taken with the ANSI state code, uniquely identifies a county (or other area) within the country. See the [U.S. Census Bureau webpage](https://www.census.gov/library/reference/code-lists/ansi.html#:~:text=American%20National%20Standards%20Institute%20codes,through%20all%20federal%20government%20agencies) [Exit](https://www.epa.gov/home/exit-epa "EPA's External Link Disclaimer") for more information about ANSI codes.

**ANSI\_NAME** \- Name of the area associated with the ANSI entity and state code.

**ANSI\_STATE\_CODE** \- Standardized facility location code as issued by the American National Standards Institute (ANSI). A full description of the codes can be accessed in the SDWA\_REF\_ANSI\_AREAS.csv. See the [U.S. Census Bureau webpage](https://www.census.gov/library/reference/code-lists/ansi.html#:~:text=American%20National%20Standards%20Institute%20codes,through%20all%20federal%20government%20agencies) [Exit](https://www.epa.gov/home/exit-epa "EPA's External Link Disclaimer") for more information about ANSI codes.

**CALCULATED\_PUB\_NOTIFICATION\_TIER** \- Numeric code for Public Notification Tier for the violation.

**CALCULATED\_RTC\_DATE** \- The date the system returned to compliance.

**CDS\_ID** \- Combined distribution system identifier.

**CITY\_NAME** \- The city in which a legal entity is located.

**CITY\_SERVED** \- The name of the city that the facility serves.

**COMPLIANCE\_EVAL\_CODE** \- Compliance evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**NON\_COMPL\_PER\_BEGIN\_DATE** \- Beginning of the noncompliance period during which a violation was identified.

**NON\_COMPL\_PER\_END\_DATE** \- End of the noncompliance period during which a violation was identified. Note that open-ended violations are listed using the later resolving action date, if the earlier resolving action is followed by certain types of enforcement actions that indicate continued enforcement activity. Note that for unresolved violations, the NON\_COMPL\_PER\_END\_DATE is listed as null.

**CONTAMINANT\_CODE (AKA CONTAMINATION\_CODE)** \- A code value that represents a contaminant for which a public water system has incurred a violation of a primary drinking water regulation. A full description of the codes can be accessed in the SDWA\_REF\_CODE\_VALUES.csv.

**CORRECTIVE\_ACTION\_ID** \- Corrective action identifier

**COUNTRY\_CODE** \- Two-character abbreviation of the country code where the administrative contact is located.

**COUNTY\_SERVED** \- The name of the county that the facility serves.

**DATA\_VERIFICATION\_EVAL\_CODE** \- Data verification evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**DBPR\_SCHEDULE\_CAT\_CODE** \- Stage 2 Disinfectant Byproducts Rule schedule category code.

-   1 – System serving 100K or more people OR systems that are connected to a system serving 100K or more
-   2 - System serving 50K to 99,999 people OR belonging to a CDS in which the largest system serves 50K to
-   3 - System serving 10K to 49,999 people OR belonging to a CDS in which the largest system serves 10K to
-   4 - System serving fewer than 10,000 AND not connected to a larger system

**DISTRIBUTION\_EVAL\_CODE** \- Distribution system evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S – Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D – Sanitary defect

**EMAIL\_ADDR** \- Email address of the administrative contact.

**ENF\_ACTION\_CATEGORY** \- Category of the enforcement action against the violation.

-   Formal – Formal enforcement
-   Informal – Informal enforcement
-   Resolving – A determination that the system has come back into compliance, no further action is needed, or the rule that was violated no longer applies

**ENFORCEMENT\_ACTION\_TYPE\_CODE** - A designated attribute which indicates the coded type of enforcement follow up action was taken by a federal or state agency. It also indicates whether enforcement action was formal, informal, subcategory, or others. For a full list of enforcement action codes and their descriptions see SDWA\_REF\_CODE\_VALUES.csv under VALUE\_TYPE = ENFORCEMENT\_ACTION\_TYPE\_CODE.

**ENFORCEMENT\_DATE** \- A field that contains the date (MM/DD/YYYY) of the enforcement action.

**ENF\_FIRST\_REPORTED\_DATE** \- Date of the first reported enforcement action against the violation (MM/DD/YYYY format).

**ENFORCEMENT\_ID** \- A number used to uniquely identify multiple occurrences of an enforcement action.

**ENF\_LAST\_REPORTED\_DATE** \- Date of the last reported enforcement action against the violation (MM/DD/YYYY format).

**ENF\_ORIGINATOR\_CODE** \- Code that indicates who the enforcement action was initiated by.

-   F- ODSWEB
-   H- Headquarter
-   R- Region
-   S- State

**EPA\_REGION** \- A two-character code identifying the EPA Region in which the system is located.

**EVENT\_ACTUAL\_DATE** - The date on which the milestone was conducted or achieved. Date format is MM/DD/YYY.

**EVENT\_COMMENTS\_TEXT** - Description of the milestone event.

**EVENT\_END\_DATE** - The date on which the milestone event ended. Date format is MM/DD/YYYY.

**EVENT\_MILESTONE\_CODE** - A four-character code identifying the event milestone.

-   DEEM - System deemed optimized without OCCT
-   DONE - System done with OCCT
-   LSLR - Lead service line replacement required
-   FICF - Fecal Indicator Contamination Action
-   SDFF - Significant Deficiency/Sanitary Defect Corrective Action
-   SDFI - Significant Deficiency/Sanitary Defect Interim Step
-   FICI - Fecal Indicator Interim Step
-   RTL1 - Revised Total Coliform Rule Level 1 Treatment Technique Trigger
-   RTL2 - Revised Total Coliform Rule Level 2 Treatment Technique Trigger

**EVENT\_REASON\_CODE** - Code identifying the reason for the milestone event.

-   B1 - Serving fewer than 50,000
-   B3 - Serving greater than 50,000: met action levels
-   WQP - Water Quality parameters
-   GW - Ground Water Rule
-   SH - Subpart H (Interim Enhanced Surface Water Treatment Rule)
-   L2TA - Maximum Contaminant Level Treatment Technique Trigger
-   L2TB - Second Level 1 Treatment Technique Trigger
-   L1TC - Level 1 Coliform Positive Insufficient Repeat Treatment Technique Trigger
-   L1TD - Level 1 Multiple Total Coliform Positive Treatment Technique Trigger
-   RTCR - Revised Total Coliform Rule

**EVENT\_SCHEDULE\_ID** - Identifier used to identify milestone events.

**FACILITY\_ACTIVITY\_CODE** - A single-character code identifying the current status of the facility.

-   A - Active
-   I - Inactive
-   N - Changed from public to non-public
-   M - Merged with another system
-   P - Potential future system to be regulated

**FACILITY\_DEACTIVATION\_DATE** - The date the facility was deactivated (no longer actively serving water) or removed from federal oversight because it no longer met SDWA criteria as a public water system (MM/DD/YYYY format).

**FACILITY\_ID**\- Facility ID that, when used with the PWSID, uniquely identifies a water system facility.

**FACILITY\_NAME** \- The name of the water system facility.

**FACILITY\_TYPE\_CODE** - Code identifying the type of facility.

-   CC - Consecutive Connection
-   CH - Common Headers
-   CS - Cistern
-   CW - Clear Well
-   DS - Distribution System System/Zone
-   IG - Infiltration Gallery
-   IN - Intake
-   NN - Non-piped, Non-purchased
-   NP - Non-piped
-   OT - Other
-   PC - Pressure Control
-   PF - Pump Facility
-   RC - Roof Catchment
-   RS - Reservoir
-   SI - Surface Impoundment
-   SP - Spring
-   SS - Sampling Station
-   ST - Storage
-   TM - Transmission Main (Manifold)
-   TP - Treatment Plant
-   WH - Wellhead
-   WL - Well

**FAX\_NUMBER** \- Administrative contact's fax number.

**FEDERAL\_MCL** \- A numeric value that represents the maximum contaminant level which was exceeded that led to the identification of an MCL violation for a public water system.

**FILTRATION\_STATUS\_CODE** \- A code reported by the state to indicate whether a non-emergency surface water source or a non-emergency ground water under the influence of surface water source is required to install filtration by a certain date or is successfully avoiding filtration.

-   MIF - Must install filtration
-   SAF - Successfully avoiding filtration
-   FIL - Filtration already in place

**FINANCIAL\_EVAL\_CODE** \- Financial evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**FINISHED\_WATER\_STOR\_EVAL\_CODE** \- Water storage evaluation from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**FIRST\_REPORTED\_DATE** \- The first reported date for the milestone event. The date format is MM/DD/YYYY.

**GEO\_ID** \- System generated ID that uniquely identifies PWSID and Area Type record.

**GW\_SW\_CODE** \- Identifies whether a system’s water source is groundwater (GW) or surface water (SW) under SDWA. An empty cell indicates the system relied on another water source.

**IS\_GRANT\_ELIGIBLE\_IND** - Indicates whether the primacy agency has reported the minimum necessary data elements for this water system to include it in grant calculations.

**IS\_HEALTH\_BASED\_IND** \- Indicates if this is a health based violation. Valid values are Y (yes) or N (no).

These violations fall into three categories:

-   Exceedances of the maximum contaminant levels (MCLs), which specify the highest allowable contaminant concentrations in drinking water;
-   Exceedances of the maximum residual disinfectant levels (MRDLs), which specify the highest concentrations of disinfectants allowed in drinking water; and
-   Treatment technique requirements, which specify certain processes intended to reduce the level of a contaminant.

**IS\_MAJOR\_VIOL\_IND** \- A code value that indicates whether a Monitoring and Reporting (MR) violation is major or minor. The major versus minor designation does not apply to a sanitary survey MR violation.

**IS\_PRIMARY\_SERVICE\_AREA\_CODE** \- Indicates whether the area is the primary service area served by the water system.

**IS\_SCHOOL\_OR\_DAYCARE\_IND** \- Indicates if the water system’s primary service area is a school or daycare, as defined by EPA/OGWDW.

**IS\_SOURCE\_IND** - Indicates whether the water system facility is designated a source (either a Consecutive Connection (CC), Infiltration Gallery (IG), Intake (IN), Non-piped (NP), Roof Catchment (RC), Reservoir (RS), Spring (SP), Well (WL), or Non-piped non-purchased (NN)).

**IS\_SOURCE\_TREATED\_IND** \- Indicates whether the water system source water is being treated or not.

**IS\_WHOLESALER\_IND** \- Indicates whether the system is a wholesaler of water.

**LAST\_REPORTED\_DATE** \- The last reported date for the milestone event. The date format is MM/DD/YYYY.

**LT2\_SCHEDULE\_CAT\_CODE** \- Single-digit code to identify the category for Long Term 2 Enhanced Surface Water Treatment (LT2) schedule.

-   1- Schedule 1
-   2- Schedule 2
-   3- Schedule 3
-   4- Schedule 4
-   5- Schedule 5

**MANAGEMENT\_OPS\_EVAL\_CODE** \- Management operations evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**ORG\_NAME** \- The organization to which the legal entity is associated.

**OTHER\_EVAL\_CODE** \- Other facility equipment/management evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**OUTSTANDING\_PERFORM\_BEGIN\_DATE** \- Date water system met the outstanding performer criteria according to state policy.

**OUTSTANDING\_PERFORMER** \- Indicates whether the system met the outstanding performer criteria according to state policy.

**OWNER\_TYPE\_CODE** \- Single-character code identifying the ownership category of the water system.

-   F – Federal government
-   L- Local government
-   M- Public/Private
-   N – Native American
-   P - Private
-   S – State government

**PHONE\_EXT\_NUMBER** \- The telephone extension of the administrative contact.

**PHONE\_NUMBER** \- The telephone number of a water system or the system’s primary contact. Format: (AAA)-EEE-NNNN where: AAA = the telephone area code, EEE = the telephone exchange, and NNNN = the telephone number. Where multiple facilities exist for a water system at different physical locations, phone number identifies the telephone number which is applicable to the primary facility of, or the principal contact for, the system.

**PN\_VIOLATION\_ID** \- Unique identifier identifying the public notification.

**POP\_CAT\_2\_CODE** \- A single-digit code identifying the service population size.

-   1 - <10,000
-   2 – 10,000+

**POP\_CAT\_3\_CODE** \- A single-digit code identifying the service population size.

-   1 - <=3,300
-   2 – 3,301-50,000
-   3 - >50,000

**POP\_CAT\_4\_CODE** \- A single-digit code identifying the service population size.

-   1 -<10K
-   2 – 10K-49,999
-   3 – 50K-99,999
-   4 – 100K+

**POP\_CAT\_5\_CODE** \- A single-digit code identifying the service population size.

-   1 - <=500
-   2 – 501-3,300
-   3 – 3301-10,000
-   4 – 10,001-100,000
-   5 - >100,000

**POP\_CAT\_11\_CODE** \- A code identifying the service population size.

-   1 - <=100
-   2 – 101 – 500
-   3 – 501-1000
-   4 – 1,001- 3,300
-   5 – 3,301- 10,000
-   6 – 10,001 – 50,000
-   7 – 50,001-100,000
-   8 – 100,001 – 250,000
-   9 – 250,001-500,000
-   10 – 500,001-1,000,000
-   11 - >1,000,000

**POPULATION\_SERVED\_COUNT** \- The estimated average daily population served by a system.

**PRIMACY\_AGENCY\_CODE** \- The primary agency code is the two-character state code or EPA Region number.

**PRIMACY\_TYPE** \- Indicates whether the water system is regulated by a state, tribal, or territorial primacy program. Note that EPA direct implementation programs, except for Wyoming, are tribal primacy programs.

**PRIMARY\_SOURCE\_CODE** \- Primary water source code.

-   GW - Ground water
-   GWP - Ground water purchased
-   SW - Surface water
-   SWP - Surface water purchased
-   GU - Groundwater under influence of surface water
-   GUP – Purchased ground water under influence of surface water source

**PUMPS\_EVAL\_CODE** \- Pumps evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**PWS\_ACTIVITY\_CODE** \- A single-character code identifying the current activity status of the public water system.

-   A - Active
-   I - Inactive
-   N - Changed from public to non-public
-   M - Merged with another system
-   P - Potential future system to be regulated

**PWS\_DEACTIVATION\_DATE** \- The date in which the water system was reported as being closed/deactivated (MM/DD/YYYY format).

**PWSID** \- A unique identifying code for a public water system in SDWIS. The PWSID consists of a two-letter state or region code, followed by seven digits.

**PWS\_NAME** \- Name of the public water system.

**PWS\_TYPE\_CODE/PWS\_TYPE\_SHORT** \- Indicates the type of public water system (PWS). A public water system is a system for the provision to the public of piped water for human consumption, which has at least 15 service connections or regularly serves an average of at least 25 individuals at least 60 days out of the year. PWS\_TYPE\_SHORT indicates whether a system is Community or Non-Community. Possible values for PWS\_TYPE\_CODE include:

-   Community water system (CWS)- A PWS that serves at least fifteen service connections used by year-round residents or regularly serves at least 25 year-round residents (e.g., homes, apartments and condominiums that are occupied year-round as primary residences).
-   Transient non-community water system (TNCWS)- A non-community water system that does not regularly serve at least 25 of the same persons over six months per year   A typical example is a campground or a highway rest stop that has its own water source, such as a drinking water well.
-   Non-transient non-community water system (NTNCWS)- A non-community PWS that regularly serves at least 25 of the same persons over six months per year. A typical example of a non-transient non-community water system is a school or an office building that has its own water source, such as a drinking water well.

**RECONCILIATION\_ID** \- An identifier used for reconciliation with the state data system or LAB assigned identifiers.

**REDUCED\_MONITORING\_BEGIN\_DATE** \- Initial date of reduced monitoring (MM/DD/YYYY format).

**REDUCED\_MONITORING\_END\_DATE**\- Reduced monitoring end date (MM/DD/YYYY format)..

**REDUCED\_RTCR\_MONITORING** \- Frequency of Revised Total Coliform Rule (RTCR) monitoring, which could be annually, quarterly, or semi-annually.

**RESULT\_SIGN\_CODE** \- Indicates if the sample result was below the minimum detection limit or equal to the value reported.

-   L - Less then, meaning below minimum detection limits
-   E - Equal to, meaning exactly equal to the value reported

**RELATED\_VIOLATION\_CODE** \- A separate violation associated with the violation.

**RULE\_CODE** \- Code for a National Drinking Water rule.

-   110- Total Coliform Rule
-   121- Surface Water Treatment Rule
-   122- Long Term 1 Enhanced Surface Water Treatment Rule
-   123- Long Term 2 Enhanced Surface Water Treatment Rule
-   130- Filter Backwash Rule
-   140- Ground Water Rule
-   210- Stage 1 Disinfectants and Disinfection Byproducts Rule
-   220- Stage 2 Disinfectants and Disinfection Byproducts Rule
-   230- Total Trihalomethanes
-   310- Volatile Organic Chemicals
-   331- Nitrates
-   332- Arsenic
-   333- Inorganic Chemicals
-   320- Synthetic Organic Chemicals
-   340- Radionuclides
-   350- Lead and Copper Rule
-   410- Public Notice Rule
-   420- Consumer Confidence Rule
-   430- Miscellaneous
-   500- Not Regulated
-   111- Revised Total Coliform Rule

**RULE\_FAMILY\_CODE** \- Code for rule family.

-   100- Microbials
-   200- Disinfectants and Disinfection Byproducts Rule
-   300- Chemicals
-   400- Other
-   500- Not Regulated

**RULE\_GROUP\_CODE** \- Code that uniquely identifies a rule group.

-   120- Surface Water Treatment Rules
-   130- Filter Backwash Rule
-   140- Groundwater Rule
-   210- Stage 1 Disinfectants and Disinfection Byproducts Rule
-   220- Stage 2 Disinfectants and Disinfection Byproducts Rule
-   230- Total Trihalomethanes
-   310- Volatile Organic Chemicals
-   320- Synthetic Organic Chemicals
-   330- Inorganic Chemicals
-   340- Radionuclides
-   350- Lead and Copper Rule
-   400- Other
-   500- Not Regulated
-   110- Total Coliform Rules
-   410- Public Notice Rule
-   420- Consumer Confidence Rule
-   430- Miscellaneous

**SAMPLE\_FIRST\_REPORTED\_DATE** \- Date that the sample was first reported. The date format is MM/DD/YYYY.

**SAMPLE\_ID** \- Identifier used to identify the sample.

**SAMPLE\_LAST\_REPORTED\_DATE** \- The most recent date of reporting. The date of format is MM/DD/YYYY.

**SAMPLE\_MEASURE** \- The measured value of the contaminant as reported from the sampling analysis.

**SAMPLE\_RESULT\_ID** \- A system-generated number managed by the reporting jurisdiction that uniquely identifies each sample result record.

**SAMPLING\_END\_DATE** \- Date of the last day of the monitoring period in which 90th percentile data for lead or copper was acquired (MM/DD/YYYY format).

**SAMPLING\_START\_DATE** \- Date of the first day of the monitoring period in which 90th percentile data for lead or copper was acquired (MM/DD/YYYY format).

**SAR\_FIRST\_REPORTED\_DATE** \- The date of the first reported sample analytical result (MM/DD/YYYY format).

**SAR\_ID** \- A system-generated number managed by the reporting jurisdiction that uniquely identifies each Sample Result record. As there are situations where there can be two sample results for a sample, the SAR\_ID is used instead of the Contaminant code (as in ODS) in the primary key of this table.

**SAR\_LAST\_REPORTED\_DATE** \- The most recent reported sample analytical result (MM/DD/YYYY format).

**SEASON\_BEGIN\_DATE** \- The opening month and day of the period of time when the water system serves water for those systems that operate seasonally (DD-MONTH format).

**SEASON\_END\_DATE** \- The ending month and day of the period of time when the water system serves water for those systems that operate seasonally (DD-MONTH format).

**SEASONAL\_STARTUP\_SYSTEM** \- Indicates whether the system pressurized including during the offseason or whether the system was not pressurized all year. Only pertains to seasonal systems.

**SECURITY\_EVAL\_CODE** \- Security evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**SELLER\_PWSID** \- PWSID of the water system that is selling water to this system through this interconnection. Is also the "upstream" water system to the parent of this facility.

**SELLER\_PWS\_NAME** \- Name of the water system that is selling water to this system through this interconnection. Is also the "upstream" water system to the parent of this facility.

**SELLER\_TREATMENT\_CODE** \- Code that indicates the treatment status of the water. Applies only to source facilities

-   F - Filtered
-   G - Treated by seller including 4-log for the Ground Water Rule
-   Y - Partially treated by seller
-   N - Not treated
-   U - Unkown

**SERVICE\_AREA\_TYPE\_CODE** \- Service area type code. For a full list of visit codes and their descriptions see SDWA\_REF\_CODE\_VALUES.csv under VALUE\_TYPE=SERVICE\_AREA\_CODE.

**SERVICE\_CONNECTIONS\_COUNT** \- Number of service connections to the water system.

**SEVERITY\_IND\_CNT** \- A count indicating the severity of certain DBPR and IESWTR violations.

**SOURCE\_PROTECTION\_BEGIN\_DATE** \- Date water system substantially implemented source water protection according to state policy (MM/DD/YYYY format).

**SOURCE\_WATER\_EVAL\_CODE** \- Source water evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**SOURCE\_WATER\_PROTECTION\_CODE** \- Indicates whether the water system has implemented source water protection according to state policy.

**STATE\_CODE** \- A coded value that represents the U.S. Postal Service (USPS) state abbreviation in which a legal entity is located. Must be one of the USPS Postal State Codes.

**STATE\_FACILITY\_ID** - The ID that a state uses to identify in their own state system database.

**STATE\_MCL** \- A numeric value that represents the maximum contaminant level which was exceeded that led to the identification of an MCL violation for a public water system.

**STATE\_SERVED** - The state that the facility is serving.

**SUBMISSION\_STATUS\_CODE** - Code that indicates whether an active water system was reported, rejected, or not reported during the recent inventory submission. This field is not applicable to inactive water systems. Generated by ODS.

-   Y - Reported and accepted
-   U - Unreported
-   R - Reported, but rejected

**SUBMISSIONYEARQUARTER** - The fiscal year and quarter when the event took place.

**TREATMENT\_EVAL\_CODE** \- Treatment evaluation results from site visit.

-   M – Minor deficiencies
-   N – No deficiencies or recommendations
-   R – Recommendations made
-   S - Significant deficiencies
-   X – Not evaluated
-   Z – Not applicable
-   D - Sanitary defect

**TRIBAL\_CODE** - EPA code which represents the Indian reservation or Alaska Remote Village being served by a Water System. A full discription of the codes can be accessed in the SDWA\_REF\_CODE\_VALUES.csv.

_Data Quality Caveat_: EPA makes no claims regarding the accuracy or precision of data concerning Indian country locations or tribal boundaries on the ECHO website. EPA has simply attempted to collect certain readily available information relating to Indian country locations. Questions concerning data should be referred to the originating program or Agency which can be referenced in EPA’s Shared Enterprise Geodata Services (SEGS) metadata files [Lower 48 Tribal Areas](https://edg.epa.gov/data.gov/B178E6D2-29E8-4966-8575-5446AC1A23FA), [Alaska Native Villages](https://edg.epa.gov/data.gov/A1AB427E-FA43-4481-B0CA-0576EDAEE18A), or [Alaska Native Allotments](https://edg.epa.gov/data.gov/1156219C-0885-4013-B277-AAD9F17F0511). The Indian country and tribal boundary locations are suitable only for general spatial reference and do not necessarily reflect EPA's position on any Indian country locations or tribal boundaries or the land status of any specific location. The inclusion of Indian country information on the ECHO website does not represent any final EPA action addressing Indian country locations or boundaries. This information cannot be relied upon to create any rights, substantive or procedural, enforceable by any party in litigation with the United States or third parties. EPA reserves the right to change information on ECHO at any time without public notice.

EPA uses the American Indian Reservation boundaries provided by the U.S. Census Bureau and the Department of Interior’s Bureau of Land Management (BLM) when developing environmental data query responses for tribes in the lower 48 United States and Alaska. EPA seeks to use the best available national federal data and may refine the tribal boundary layer in the future as more accurate national federal data becomes available.

**UNIT\_OF\_MEASURE** \- Units for value in SAMPLE\_MEASURE.

**VALUE\_CODE** \- The values associated with the code in VALUE\_TYPE.

**VALUE\_DESCRIPTION** \-The full description of the code in VALUE\_CODE.

**VALUE\_TYPE** \- Column name associated with the value code as found in the other files.

**VIOL\_FIRST\_REPORTED\_DATE** \- Date of the first reported violation (MM/DD/YYYY format).

**VIOL\_LAST\_REPORTED\_DATE** \- Date of the last reported violation (MM/DD/YYYY format).

**VIOL\_ORIGINATOR\_CODE** \- Code that indicates who the violation was initiated by.

-   F- ODSWEB
-   H- Headquarter
-   R- Region
-   S- State

**VIOLATION\_CATEGORY\_CODE** \- The category of violation that is reported.

-   TT- Treatment Technique Violation
-   MRDL- Maximum Residual Disinfectant Level
-   Other- Other Violation
-   MCL- Maximum Contaminant Level Violation
-   MR- Monitoring and Reporting
-   MON- Monitoring Violation
-   RPT- Reporting Violation

**VIOLATION\_CODE** \- A full description of violation codes can be accessed in the SDWA\_REF\_CODE\_VALUES (CSV) table.

**VIOLATION\_ID** \- System-generated identifier for a violation.

**VIOLATION\_STATUS** \- Current status of the violation.

-   **Resolved** \- The violation has at least one [resolving enforcement action](https://echo.epa.gov/help/reports/dfr-data-dictionary#resolvingaction). In SDWIS, this indicates that either the system has returned to compliance from the violation, the rule that was violated was no longer applicable, or no further action was needed.
-   **Archived** - The violation is not Resolved, but is more than five years past its noncompliance period end date. In keeping with the [Enforcement Response Policy](https://www.epa.gov/enforcement/enforcement-response-policy-public-water-system-supervision-pwss-program-under-safe), the violation no longer contributes to the public water system's overall compliance status. Unresolved violations are also marked as Archived when a system ceases operations (becomes inactive).
-   **Addressed** - The violation is not Resolved or Archived, and is addressed by one or more [formal enforcement actions](https://echo.epa.gov/help/reports/dfr-data-dictionary#sdwa_fea).
-   **Unaddressed** \- The violation is not Resolved or Archived, and has not been addressed by formal enforcement.

**VIOL\_MEASURE** \- A numeric value that represents the analytical result of a contaminant that exceeded the Maximum Contaminant Level (MCL) for that contaminant. For contaminants that can be monitored with a reliable degree of accuracy, an MCL is set. For those which cannot be monitored reliably, a treatment technique is set instead. Both standards are set at a level sufficient to protect the public's health.

**VISIT\_COMMENTS** \- Comments of site visit by the visitor.

**VISIT\_DATE** \- The date (MM/DD/YYYY) of the site visit.

**VISIT\_ID** \- The identification number for each visit.

**VISIT\_REASON\_CODE** \- Code to indicate the reason for the site visit. For a full list of visit codes and their descriptions see SDWA\_REF\_CODE\_VALUES.csv under VALUE\_TYPE = VISIT\_REASON\_CODE.

**WATER\_TYPE\_CODE** - Character code identifying the type of water source. Ground water (GW), Surface water (SW), Ground water under the influence of surface water (GU). See the [Water Topics](http://water.epa.gov/drink/resources/glossary.cfm) page on the EPA website for full definitions of these terms and more.

**ZIP\_CODE** \- The U.S. Postal Service (USPS) ZIP code in which a legal entity is located. Format: ZZZZZEEEE where ZZZZZ=the ZIP code and EEEE= the optional ZIP+4 extension.

**ZIP\_CODE\_SERVED**\-  The 5-digit postal zip code that the facility serves.


---

## 🔗 Extra Reference Links

Below are some links to FAQs, reports, and guidelines that might come in handy as you work through the challenge.
- [EPA Drinking Water Data & Tools Guide](https://www.epa.gov/DWdata/drinking-water-data-tools-guide)
- [EPA National Primary Drinking Water Regulations](https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations)
- [SDWIS Search User Guide](https://www.epa.gov/enviro/sdwis-search-user-guide)
- [Safe Drinking Water Act Compliance Monitoring](https://www.epa.gov/compliance/safe-drinking-water-act-compliance-monitoring)
- [Consumer Confident Report Rule: A Quick Reference Guide](https://www.epa.gov/sites/default/files/2014-05/documents/guide_qrg_ccr_2011.pdf)
- [Fact Sheet: What to Expect During a Public Water System Inspection](https://www.epa.gov/compliance/fact-sheet-what-expect-during-public-water-system-inspection)
- [Providing Safe Drinking Water in America: National Public Water Systems Compliance Report](https://www.epa.gov/compliance/providing-safe-drinking-water-america-national-public-water-systems-compliance-report)
- [Drinking Water Rule Quick Reference Guides](https://www.epa.gov/dwreginfo/drinking-water-rule-quick-reference-guides)
- [Fifth Unregulated Contaminant Monitoring Rule Data Finder](https://www.epa.gov/dwucmr/fifth-unregulated-contaminant-monitoring-rule-data-finder) This includes PFAS (forever chemical) data - one of the biggest health issues facing our water systems but not currently included in the standard SDWIS data package. 
