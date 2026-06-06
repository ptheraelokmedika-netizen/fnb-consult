Create a new full-stack web application called \*\*“F\&B Business Consultant Calculator”\*\*.



GOAL:

Build a professional business consulting calculator for F\&B projects such as cafes, beverage shops, food stalls, cloud kitchens, kiosks, and tenant-based F\&B businesses.



The app must help a consultant calculate, compare, explain, and present business setup plans for each cafe/project, including:



\* ownership structure

\* capital contribution

\* revenue sharing

\* profit sharing

\* equipment cost

\* renovation cost

\* rental cost

\* product sourcing models

\* consignment/vendor products

\* electricity usage from equipment

\* monthly operating cost

\* budget vs actual spending

\* project summary for pitch deck / PDF



The app should be easy to understand for non-finance users and useful for consultants when pitching an idea to investors or cafe owners.



Primary language:



\* Indonesian first.

\* Use clear, simple Bahasa Indonesia.

\* Add optional English translation structure later.



Tech stack:



\* Next.js App Router

\* TypeScript

\* Tailwind CSS

\* shadcn/ui style components

\* Local-first data using localStorage or IndexedDB

\* Prepare clean structure for future database migration to PostgreSQL / Supabase / Neon

\* No paid API required



==================================================

APP STRUCTURE

=============



Create these main pages:



1\. Dashboard Project

2\. Buat / Edit Project Cafe

3\. Struktur Kepemilikan \& Investor

4\. Modal Awal \& Pengadaan

5\. Produk \& Vendor System

6\. Equipment \& Electricity Calculator

7\. Budget vs Actual

8\. Monthly Operating Projection

9\. Simulasi Balik Modal \& Realistic Opening Scenario

10\. Profit Sharing Simulation

11\. Project Summary / Pitch Page

12\. Settings / Master Data



Each project must be saved separately.

User must be able to create multiple cafe projects.



Example projects:



\* Cafe sendiri

\* Cafe dengan beberapa pemegang saham

\* Cafe baru

\* Cafe lama yang sudah berjalan

\* Beverage only

\* Food and Beverage

\* Tenant product masuk ke cafe

\* Consignment product

\* Bagi hasil dengan vendor

\* Produk beli putus lalu dijual naik harga



==================================================

PROJECT BASICS

==============



Each project should have:



\* Project name

\* Cafe / brand name

\* Business type:



&#x20; \* Cafe full service

&#x20; \* Beverage only

&#x20; \* Food and Beverage

&#x20; \* Dessert shop

&#x20; \* Cloud kitchen

&#x20; \* Booth / tenant

&#x20; \* Other

\* Project status:



&#x20; \* Baru mulai

&#x20; \* Sudah berjalan

&#x20; \* Take over usaha lama

&#x20; \* Rebranding / renovasi

\* Place status:



&#x20; \* Tempat sendiri

&#x20; \* Sewa

&#x20; \* Revenue sharing dengan pemilik tempat

&#x20; \* Tenant / booth

&#x20; \* Partnership location

\* Location notes

\* Target opening date

\* Consultant notes



Show a simple project card on dashboard:



\* Cafe name

\* Status

\* Total estimated capital

\* Total actual spending

\* Monthly estimated operating cost

\* Estimated monthly net profit

\* Project health status:



&#x20; \* Draft

&#x20; \* In progress

&#x20; \* Ready to pitch

&#x20; \* Opened

&#x20; \* Needs review



==================================================

OWNERSHIP / INVESTOR STRUCTURE

==============================



Create a module to input ownership structure.



User can choose:



A. Cafe sendiri



\* 1 owner

\* 100% ownership



B. Several shareholders / partners

Allow adding multiple people:



\* Name

\* Role:



&#x20; \* Owner

&#x20; \* Investor

&#x20; \* Operational partner

&#x20; \* Landlord partner

&#x20; \* Brand owner

&#x20; \* Silent investor

\* Capital contribution

\* Ownership percentage

\* Profit sharing percentage

\* Voting / decision power percentage

\* Notes



Ownership mode:



1\. Equal ownership

&#x20;  Example:

&#x20;  4 partners → each 25%



2\. Custom percentage

&#x20;  Example:

&#x20;  Investor A 50%

&#x20;  Investor B 30%

&#x20;  Operator 20%



3\. Based on capital contribution

&#x20;  Ownership auto-calculated from capital contribution.



4\. Hybrid

&#x20;  Capital contribution and custom profit share may differ.



Important:

Show warning if total ownership percentage is not 100%.

Show warning if total profit sharing percentage is not 100%.

Allow ownership percentage and profit sharing percentage to be different.



==================================================

BUSINESS SCHEME OPTIONS

=======================



Create a section called “Skema Bisnis”.



User can choose one or more:



1\. Saham kosong

&#x20;  Meaning:

&#x20;  A person gets ownership/profit share without cash contribution, usually because they bring skill, location, brand, management, recipe, network, or operational work.



Fields:



\* Person name

\* Reason for saham kosong

\* Percentage given

\* Is it ownership, profit share, or both?

\* Vesting / condition notes



2\. Bagi hasil rata

&#x20;  Fields:



\* Number of partners

\* Equal percentage

\* Notes



3\. Bagi hasil custom

&#x20;  Fields:



\* Partner name

\* Profit percentage

\* Loss responsibility percentage

\* Notes



4\. Modal masuk

&#x20;  Fields:



\* Investor name

\* Amount

\* Ownership received

\* Return expectation

\* Notes



5\. Cafe lama

&#x20;  Fields:



\* Existing assets value

\* Existing inventory value

\* Existing equipment value

\* Existing brand value

\* Existing debts/liabilities

\* Existing monthly revenue

\* Existing monthly cost

\* Need renovation? yes/no

\* Need rebranding? yes/no



6\. Cafe baru

&#x20;  Fields:



\* Estimated opening cost

\* Estimated monthly operating cost

\* Estimated break-even month

\* Notes



==================================================

EXISTING ASSETS

===============



Create a module “Barang / Aset Sebelumnya”.



Question:

“Apakah sudah ada barang/aset sebelumnya?”



If yes, allow adding existing assets:



Fields:



\* Asset name

\* Category:



&#x20; \* Kitchen equipment

&#x20; \* Beverage equipment

&#x20; \* Furniture

&#x20; \* Decoration

&#x20; \* Renovation

&#x20; \* Inventory

&#x20; \* Packaging

&#x20; \* Electronics

&#x20; \* POS system

&#x20; \* Other

\* Owner of asset

\* Estimated current value

\* Original purchase price

\* Condition:



&#x20; \* New

&#x20; \* Good

&#x20; \* Used

&#x20; \* Needs repair

\* Counted as capital contribution? yes/no

\* Notes



Calculation:

If asset is counted as capital contribution, include its current estimated value in that partner’s contribution.



==================================================

SETUP COST / NECESSARY CHECKLIST

================================



Create a checklist module for necessary setup items.



Default checklist should include:



A. Place / Location



\* Deposit sewa

\* Sewa bulan pertama

\* Legal / permit / admin

\* Renovasi ringan

\* Renovasi besar

\* Interior

\* Signage / papan nama

\* Lighting

\* AC / ventilation

\* Cleaning preparation



B. Equipment



\* Coffee machine

\* Grinder

\* Blender

\* Chiller

\* Freezer

\* Showcase

\* Oven

\* Stove

\* Rice cooker

\* Fryer

\* Mixer

\* Water dispenser

\* Water filter

\* Sink / washing area

\* POS device

\* Printer receipt

\* CCTV

\* Wi-Fi router



C. Furniture \& Interior



\* Table

\* Chair

\* Sofa

\* Bar counter

\* Display rack

\* Storage rack

\* Trash bin

\* Menu board

\* Decoration



D. Smallwares



\* Glass

\* Cup

\* Plate

\* Spoon

\* Fork

\* Knife

\* Tray

\* Food container

\* Measuring cup

\* Shaker

\* Strainer

\* Tongs

\* Cutting board



E. Initial Stock



\* Coffee beans

\* Milk

\* Syrup

\* Powder

\* Tea

\* Sugar

\* Sauce

\* Dry food ingredients

\* Frozen food ingredients

\* Packaging

\* Tissue

\* Straw

\* Cup seal

\* Label sticker



F. Operational



\* Staff uniform

\* Training cost

\* Opening promo

\* Soft opening budget

\* Marketing content

\* Menu design

\* Branding design

\* Contingency fund



For each item:



\* Item name

\* Category

\* Required? yes/no

\* Estimated price

\* Actual price

\* Quantity

\* Vendor

\* Paid by which partner

\* Already purchased? yes/no

\* Purchase date

\* Notes



Calculation:



\* Estimated total

\* Actual total

\* Difference

\* Over budget / under budget

\* Remaining items not purchased yet



Show status:



\* Belum dibeli

\* Sudah dibeli

\* Over budget

\* Under budget

\* Optional



==================================================

BUDGET VS ACTUAL

================



Create a clean table comparing estimated cost and actual spending.



Columns:



\* Category

\* Estimated budget

\* Actual spending

\* Difference

\* Status

\* Notes



Status logic:



\* If actual > estimated → Over Budget

\* If actual < estimated → Under Budget

\* If actual = estimated → On Budget

\* If actual is empty → Not Purchased Yet



Show summary cards:



\* Total Estimated Budget

\* Total Actual Spending

\* Remaining Budget

\* Over Budget Amount

\* Items Not Purchased

\* Percentage Completion



==================================================

PRODUCT / VENDOR SYSTEM

=======================



Create module for products sold in the cafe.



Product type:



\* Own product

\* Vendor product

\* Consignment product

\* Beli putus

\* Bagi hasil

\* Tenant product

\* Dropship / external product



Fields:



\* Product name

\* Category:



&#x20; \* Beverage

&#x20; \* Food

&#x20; \* Snack

&#x20; \* Dessert

&#x20; \* Merchandise

&#x20; \* Other

\* Source:



&#x20; \* Made in-house

&#x20; \* Bought from vendor

&#x20; \* Consignment

&#x20; \* Revenue sharing

&#x20; \* Tenant

\* Selling price

\* Cost price

\* Suggested markup percentage

\* Gross profit per item

\* Gross margin percentage

\* Vendor name

\* Payment term

\* Notes



For “Beli Putus”:



\* Purchase price

\* Selling price

\* Markup

\* Margin

\* Stock risk belongs to cafe



For “Consignment”:



\* Selling price

\* Vendor share percentage

\* Cafe share percentage

\* Unsold stock handled by whom?

\* Payment cycle:



&#x20; \* Daily

&#x20; \* Weekly

&#x20; \* Monthly

\* Display space needed

\* Equipment needed:



&#x20; \* Showcase

&#x20; \* Chiller

&#x20; \* Freezer

&#x20; \* Oven

&#x20; \* Warmer

&#x20; \* Counter space

&#x20; \* Other



For “Bagi Hasil”:



\* Gross revenue

\* Cost responsibility:



&#x20; \* Vendor handles COGS

&#x20; \* Cafe handles COGS

&#x20; \* Shared

\* Vendor percentage

\* Cafe percentage

\* Electricity paid by:



&#x20; \* Cafe

&#x20; \* Vendor

&#x20; \* Shared

\* Staff handling paid by:



&#x20; \* Cafe

&#x20; \* Vendor

&#x20; \* Shared



For “Tenant product”:



\* Fixed rent per month

\* Percentage of sales

\* Minimum guarantee

\* Utility fee

\* Display fee

\* Notes



Calculations:



\* Profit per item

\* Cafe income per item

\* Vendor income per item

\* Monthly estimated sales

\* Monthly gross revenue

\* Monthly cafe net income from product

\* Monthly vendor payout



==================================================

EQUIPMENT \& ELECTRICITY CALCULATOR

==================================



Create equipment calculator especially for vendor products that use electricity.



Fields:



\* Equipment name

\* Used for product/vendor

\* Owner:



&#x20; \* Cafe

&#x20; \* Vendor

&#x20; \* Shared

\* Equipment type:



&#x20; \* Showcase

&#x20; \* Chiller

&#x20; \* Freezer

&#x20; \* Oven

&#x20; \* Warmer

&#x20; \* Coffee machine

&#x20; \* Blender

&#x20; \* Stove

&#x20; \* Other

\* Power usage in watt

\* Hours used per day

\* Days used per month

\* Electricity tariff per kWh

\* Monthly kWh

\* Monthly electricity cost

\* Who pays electricity:



&#x20; \* Cafe

&#x20; \* Vendor

&#x20; \* Shared percentage

\* Notes



Formula:

kWh per month = watt / 1000 × hours per day × days per month

Monthly electricity cost = kWh per month × electricity tariff



If shared:

Cafe cost = monthly electricity cost × cafe percentage

Vendor cost = monthly electricity cost × vendor percentage



Show summary:



\* Total electricity usage per month

\* Total electricity cost

\* Cafe electricity responsibility

\* Vendor electricity responsibility



Add default electricity tariff field in Settings.

Allow user to change it.



==================================================

MONTHLY OPERATING PROJECTION

============================



Create monthly projection module.



Revenue fields:



\* Estimated daily sales

\* Operating days per month

\* Estimated monthly sales

\* Product revenue by category

\* Vendor / consignment income

\* Other income



Cost fields:



\* COGS food

\* COGS beverage

\* Staff salary

\* Rent

\* Electricity

\* Water

\* Internet

\* Gas

\* Packaging

\* Cleaning

\* Marketing

\* Platform fee

\* Maintenance

\* Miscellaneous

\* Loan installment

\* Investor return

\* Other cost



Calculation:



\* Monthly gross revenue

\* Monthly COGS

\* Gross profit

\* Operating expense

\* Net profit before sharing

\* Net margin percentage

\* Break-even sales

\* Break-even days

\* Payback period in months





==================================================

SIMULASI BALIK MODAL \& REALISTIC OPENING SCENARIO

==================================================



Create a new module called “Simulasi Balik Modal \& Realistic Opening Scenario”.



GOAL:

This module helps consultants estimate realistic early-stage cafe performance based on:

\- expected customer count

\- average beverage price

\- average food price

\- product mix between own products and consignment/vendor products

\- estimated gross margin

\- monthly operating cost

\- initial investment

\- payback period



The goal is not to create an overly complicated financial model.

The goal is to create a practical, easy-to-understand simulation for early cafe planning and pitch discussion.



SCENARIO TYPES:

Create 3 default editable scenario tabs:



1\. Conservative

For slow early opening.

Use lower customer count, lower average spending, and safer assumptions.



2\. Realistic

For normal expected outcome.

Use moderate customer count, normal average spending, and this should be the main planning scenario.



3\. Optimistic

For best-case early performance.

Use higher customer count, better conversion, and higher average spending.



MAIN INPUTS FOR EACH SCENARIO:



A. Customer Estimate

\- Average customers per day

\- Operating days per month

\- Percentage buying beverage

\- Percentage buying food

\- Percentage buying both food and beverage



B. Average Price

\- Average beverage selling price

\- Average food selling price

\- Average consignment product selling price

\- Average own product selling price



C. Product Mix

Allow percentage split:

\- Own beverage product %

\- Own food product %

\- Consignment product %

\- Vendor / bagi hasil product %

\- Beli putus product %



Show warning if total product mix is not 100%.



D. Margin Assumption

For each product type:

\- Own beverage gross margin %

\- Own food gross margin %

\- Consignment cafe share %

\- Vendor/bagi hasil cafe share %

\- Beli putus gross margin %



E. Monthly Fixed Cost

\- Rent

\- Staff salary

\- Electricity

\- Water

\- Internet

\- Gas

\- Marketing

\- Cleaning

\- Maintenance

\- Miscellaneous



F. Initial Investment

Automatically pull from setup budget:

\- Estimated setup cost

\- Actual setup cost

\- Existing assets counted as capital

\- Renovation cost

\- Equipment cost

\- Opening stock

\- Other pre-opening cost



Allow user to choose:

\- Calculate payback from estimated budget

\- Calculate payback from actual spending



CALCULATION LOGIC:



1\. Daily estimated revenue

daily revenue =

(customers per day × beverage buyer % × average beverage price)

\+ (customers per day × food buyer % × average food price)

\+ estimated consignment/vendor product revenue



2\. Monthly estimated revenue

monthly revenue = daily revenue × operating days per month



3\. Estimated gross profit

gross profit = revenue × weighted gross margin



Weighted margin should consider product mix:

\- Own beverage margin

\- Own food margin

\- Consignment cafe share

\- Vendor share

\- Beli putus margin



4\. Monthly operating cost

Sum all fixed monthly costs.



5\. Estimated monthly net profit

monthly net profit = gross profit - monthly operating cost



6\. Break-even monthly revenue

break-even revenue = monthly operating cost / weighted gross margin



7\. Break-even customers per day

break-even customers per day = break-even revenue / operating days / average transaction value



8\. Payback period

payback months = initial investment / monthly net profit



If monthly net profit <= 0, show:

“Belum balik modal karena simulasi masih rugi atau profit belum cukup.”



9\. Daily sales target to break even

Show how much daily revenue is needed to cover monthly operating cost.



10\. Customer target to break even

Show minimum customers per day needed.



OUTPUT DISPLAY:

Show summary cards:

\- Omzet per bulan

\- Laba kotor

\- Biaya operasional

\- Estimasi laba bersih

\- Net margin

\- Target omzet minimal

\- Target sales per hari

\- Target customer minimal per hari

\- Perkiraan balik modal dalam bulan

\- Perkiraan balik modal dalam tahun



REALISTIC OUTCOME INTERPRETATION:

Add an interpretation box that explains the result in simple Indonesian.



If payback <= 12 months:

“Simulasi ini cukup menarik. Dengan asumsi customer dan margin tercapai, modal berpotensi kembali dalam kurang dari 1 tahun.”



If payback 13–24 months:

“Simulasi ini masih cukup realistis untuk F\&B, tetapi perlu kontrol biaya dan strategi penjualan yang stabil.”



If payback > 24 months:

“Balik modal cukup lama. Perlu evaluasi harga jual, biaya sewa, payroll, atau target customer.”



If net profit <= 0:

“Dengan asumsi saat ini, usaha belum menghasilkan laba. Perlu menaikkan omzet, mengurangi biaya tetap, atau memperbaiki margin produk.”



SIMPLE RECOMMENDATION ENGINE:

Add simple automatic recommendations:



If rent is too high compared to revenue:

“Biaya sewa terlihat cukup berat dibanding omzet. Pertimbangkan negosiasi sewa atau target sales lebih tinggi.”



If staff cost is too high:

“Biaya staff cukup besar. Pertimbangkan jadwal shift lebih efisien di awal.”



If margin is low:

“Margin produk rendah. Review HPP, harga jual, atau komposisi produk sendiri vs konsinyasi.”



If customer target is very high:

“Target customer per hari cukup tinggi. Pastikan lokasi, traffic, dan marketing mampu mendukung angka ini.”



If consignment share is too dominant:

“Pendapatan dari produk konsinyasi cenderung lebih kecil. Pastikan produk sendiri tetap menjadi sumber margin utama.”



SUMMARY PAGE INTEGRATION:

Add this module into the Project Summary page.



The summary should show:

\- Selected scenario used for pitch: Conservative / Realistic / Optimistic

\- Expected customers per day

\- Average transaction value

\- Estimated monthly revenue

\- Estimated net profit

\- Break-even sales target

\- Break-even customer target

\- Estimated payback period

\- Consultant recommendation



Add a section title:

“Simulasi Balik Modal \& Target Realistis”



IMPORTANT UX:

Keep this page simple and not too intimidating.



Use:

\- sliders for customer per day

\- currency inputs for average price

\- percentage inputs for product mix and margin

\- cards for result

\- simple explanation text



Add helper text:

“Gunakan angka konservatif untuk awal opening agar proyeksi tidak terlalu optimis.”



Add disclaimer:

“Simulasi ini adalah estimasi awal. Hasil aktual dapat berbeda tergantung traffic lokasi, kualitas produk, repeat customer, promosi, harga bahan baku, dan operasional harian.”



DATA MODEL ADDITION:

Add TypeScript interfaces:



OpeningScenario

\- id

\- name: Conservative | Realistic | Optimistic | Custom

\- customersPerDay

\- operatingDaysPerMonth

\- beverageBuyerPercentage

\- foodBuyerPercentage

\- bothBuyerPercentage

\- averageBeveragePrice

\- averageFoodPrice

\- averageConsignmentPrice

\- averageOwnProductPrice

\- productMix

\- marginAssumptions

\- fixedCosts

\- investmentSource: estimated | actual

\- selectedForPitch: boolean



OpeningScenarioResult

\- dailyRevenue

\- monthlyRevenue

\- weightedGrossMargin

\- grossProfit

\- monthlyOperatingCost

\- netProfit

\- netMargin

\- breakEvenMonthlyRevenue

\- breakEvenDailyRevenue

\- breakEvenCustomersPerDay

\- paybackMonths

\- paybackYears

\- interpretation

\- recommendations



CALCULATION UTILITIES ADDITION:

Add reusable functions:

\- calculateWeightedGrossMargin

\- calculateDailyRevenueFromScenario

\- calculateMonthlyRevenueFromScenario

\- calculateScenarioGrossProfit

\- calculateScenarioNetProfit

\- calculateBreakEvenRevenue

\- calculateBreakEvenCustomersPerDay

\- calculatePaybackMonths

\- generateScenarioInterpretation

\- generateScenarioRecommendations



SEED DATA ADDITION:

In “Demo Cafe Kemitraan”, include 3 opening scenarios:



Conservative:

\- 30 customers/day

\- 26 operating days/month

\- average beverage price Rp22.000

\- average food price Rp30.000



Realistic:

\- 50 customers/day

\- 26 operating days/month

\- average beverage price Rp25.000

\- average food price Rp35.000



Optimistic:

\- 80 customers/day

\- 26 operating days/month

\- average beverage price Rp28.000

\- average food price Rp40.000



Make Realistic selected as default pitch scenario.



==================================================

PROFIT SHARING SIMULATION

=========================



Create profit sharing simulator.



Input:



\* Monthly net profit

\* Profit sharing mode:



&#x20; \* Based on ownership percentage

&#x20; \* Based on custom profit percentage

&#x20; \* Fixed management fee first, then profit share

&#x20; \* Investor return first, then profit share

&#x20; \* Operator salary first, then profit share



For each partner:



\* Partner name

\* Role

\* Ownership percentage

\* Profit share percentage

\* Fixed fee / salary

\* Profit received

\* Notes



Show:



\* Total profit before sharing

\* Total fixed fees

\* Remaining distributable profit

\* Profit share per partner

\* Final received amount per partner



Add warning:

“Simulasi ini hanya estimasi. Skema final harus disepakati dalam perjanjian tertulis.”



==================================================

SUMMARY / PITCH PAGE

====================



Create a special one-page summary for each cafe project.



This page must be clean, professional, and easy to understand.



Sections:



1\. Project Overview



\* Cafe name

\* Business type

\* New or existing cafe

\* Place status

\* Main concept

\* Target opening date



2\. Ownership \& Partnership



\* Owner / investor list

\* Capital contribution

\* Ownership percentage

\* Profit sharing percentage

\* Notes for saham kosong if any



3\. Setup Budget



\* Estimated total setup cost

\* Actual spending

\* Remaining budget

\* Over budget / under budget

\* Biggest cost categories



4\. Existing Assets



\* Total existing asset value

\* Assets counted as capital contribution

\* Notes



5\. Product \& Vendor Strategy



\* Own products

\* Vendor products

\* Consignment products

\* Beli putus products

\* Bagi hasil products

\* Summary of expected cafe income



6\. Equipment \& Electricity



\* Total equipment value

\* Monthly electricity cost

\* Equipment paid by cafe/vendor/shared

\* Special vendor equipment notes



7\. Monthly Projection



\* Estimated monthly revenue

\* Estimated monthly cost

\* Estimated monthly net profit

\* Net margin

\* Break-even point

\* Payback period



8\. Partner Profit Simulation



\* Partner name

\* Expected monthly profit received

\* Notes



9\. Consultant Notes



\* Strength

\* Risk

\* Recommendation

\* Next action



10\. Decision Status



\* Draft

\* Need revision

\* Ready for investor

\* Approved

\* Opened



Add button:



\* Export PDF

\* Print

\* Duplicate project

\* Save project



PDF should include:



\* Cafe/project name

\* Generated date

\* All summary sections

\* Professional layout

\* Footer disclaimer



Disclaimer:

“Dokumen ini adalah simulasi bisnis dan alat bantu konsultasi. Angka dapat berubah sesuai kondisi aktual, harga vendor, lokasi, operasional, dan perjanjian para pihak. Gunakan dokumen ini sebagai bahan diskusi, bukan pengganti perjanjian hukum atau laporan keuangan final.”



==================================================

SETTINGS / MASTER DATA

======================



Create Settings page for:



1\. Business consultant profile



\* Consultant / company name

\* Logo placeholder

\* Phone

\* Email

\* Address

\* Notes



2\. Default electricity tariff



\* Tariff per kWh



3\. Default checklist item library

&#x20;  Allow user to add/edit/delete default checklist items.



4\. Default categories



\* Setup cost category

\* Product category

\* Expense category

\* Equipment category



5\. PDF settings



\* Show logo yes/no

\* Show consultant contact yes/no

\* Default disclaimer



==================================================

UX REQUIREMENTS

===============



The app must feel professional, modern, and simple.



Design style:



\* Clean dashboard

\* Soft neutral background

\* Cards and tables

\* Clear summary cards

\* Use Indonesian labels

\* Avoid clutter

\* Use step-by-step project wizard style where possible



Important:



\* Many users are not finance experts.

\* Add helper text under important fields.

\* Add tooltips for terms like saham kosong, consignment, bagi hasil, break-even, payback period, gross margin.

\* Use clear status badges.



Responsive:



\* Desktop: table and dashboard layout

\* Mobile: card-based layout



==================================================

DATA MODEL

==========



Create TypeScript interfaces for:



Project

Partner

OwnershipStructure

ExistingAsset

SetupBudgetItem

Product

Vendor

Equipment

ElectricityCalculation

MonthlyProjection

OpeningScenario

OpeningScenarioResult

ProfitSharingSimulation

Summary

Settings



Use localStorage or IndexedDB persistence.



Each project should have:



\* id

\* createdAt

\* updatedAt

\* name

\* status

\* all related modules



==================================================

CALCULATION REQUIREMENTS

========================



Implement calculation utilities:



1\. Ownership percentage from capital contribution

2\. Equal ownership split

3\. Total estimated setup budget

4\. Total actual spending

5\. Budget difference

6\. Product gross margin

7\. Product markup

8\. Consignment cafe share

9\. Vendor payout

10\. Electricity kWh calculation

11\. Monthly electricity cost

12\. Monthly revenue projection

13\. Gross profit

14\. Net profit

15\. Break-even sales

16\. Break-even days

17\. Payback period

18\. Profit sharing per partner

19\. Weighted gross margin from product mix

20\. Daily/monthly revenue from customer and average price assumptions

21\. Opening scenario break-even customer target

22\. Opening scenario payback months and years

23\. Scenario interpretation and recommendation text



Make calculations readable and reusable.



==================================================

IMPORTANT EDGE CASES

====================



Handle:



\* Empty data

\* Zero division

\* Percentages not totaling 100%

\* Missing product cost

\* Missing electricity tariff

\* Existing asset counted as capital contribution

\* Custom ownership and custom profit share

\* Negative profit month

\* Over-budget items

\* Cafe old business with existing assets



Show warnings, not crashes.



==================================================

SEED DATA

=========



Add example demo project:

“Demo Cafe Kemitraan”



With:



\* 3 partners

\* One investor with cash capital

\* One operator with saham kosong

\* One location owner with profit sharing

\* Beverage-only concept

\* Some existing assets

\* Some new equipment

\* One consignment dessert product using showcase

\* Electricity calculation for showcase

\* Monthly projection

\* Profit sharing simulation

\* Completed summary page



==================================================

FINAL OUTPUT EXPECTATION

========================



Build a working MVP with:



\* Create/edit/save project

\* Add partners

\* Add setup budget checklist

\* Add actual purchase price

\* Add products and vendor schemes

\* Add equipment and electricity calculation

\* Add monthly projection

\* Add profit sharing simulation

\* Generate one-page project summary

\* Export/print PDF

\* Local persistence

\* Clean UI



Do not make only mock UI.

Make the app functional.



