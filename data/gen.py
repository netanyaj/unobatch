"""Generate the made-up partner dataset for the matchmaking prototype."""
import json, sys

PS, HF, BK, SF, RB, FC, CH, CD, PU, FB, CO = (
    "protein-snacks", "high-fibre-bars", "bakery", "sugar-free-desserts",
    "rte-breakfast", "filled-chocolates", "fresh-cheese", "chilled-dairy",
    "clean-label-purees", "functional-beverages", "functional-coffee")
A, C, F = "ambient", "chilled", "frozen"

def o(date, cat, result, note):
    return {"date": date, "category": cat, "result": result, "note": note}

P = []
def add(id, name, type, cats, caps, storage, mn, mx, certs, city, workload, outcomes=()):
    P.append({"id": id, "name": name, "type": type, "categories": cats,
              "capabilities": caps, "storage": storage,
              "minBatchKg": mn, "maxBatchKg": mx, "certifications": certs,
              "city": city, "workload": workload, "pastOutcomes": list(outcomes)})

# ---------------- Food technologists (12) ----------------
T = "technologist"
add("T01", "Anika Rao (food technologist)", T, [PS, HF, BK],
    ["bar reformulation", "texture fixes", "protein fortification", "shelf-life planning"],
    [A], None, None, [], "Bangalore", "medium",
    [o("2026-03", HF, "went_ahead", "Fixed bar hardening with a glycerine and fibre blend"),
     o("2026-07", PS, "went_ahead", "Protein crisps reformulated in 3 weeks")])
add("T02", "Vikram Shetty (food technologist)", T, [CD, CH, SF],
    ["dairy process design", "culture selection", "sugar reduction", "shelf-life planning"],
    [C, F], None, None, [], "Bangalore", "full",
    [o("2026-05", CD, "went_ahead", "Set up a high-protein curd recipe for pilot"),
     o("2026-09", CH, "declined", "No time this quarter")])
add("T03", "Leena Joseph (food technologist)", T, [FB, CO],
    ["beverage formulation", "botanical extracts", "caffeine dosing", "label claims"],
    [A, C], None, None, [], "Kochi", "low",
    [o("2026-06", FB, "went_ahead", "Ashwagandha drink moved to pilot")])
add("T04", "Rohan Mehta (food technologist)", T, [BK, RB],
    ["baking process", "clean-label emulsifiers", "texture fixes", "scale-up planning"],
    [A], None, None, [], "Mumbai", "medium",
    [o("2026-02", BK, "went_ahead", "Millet cookie scaled from kitchen to pilot"),
     o("2026-08", RB, "didnt_work", "Brand changed direction after first trial")])
add("T05", "Priya Natarajan (food technologist)", T, [SF, FC],
    ["sugar reduction", "sweetener blends", "chocolate tempering", "fat bloom fixes"],
    [A, C, F], None, None, [], "Chennai", "low",
    [o("2026-04", FC, "went_ahead", "Stopped fat bloom in a filled bar"),
     o("2026-10", SF, "accepted", "Working on a sugar-free kulfi")])
add("T06", "Arjun Desai (food technologist)", T, [PS, FB],
    ["protein fortification", "plant protein taste masking", "extrusion"],
    [A], None, None, [], "Pune", "medium",
    [o("2026-06", PS, "didnt_work", "Taste masking didn't reach the brand's target")])
add("T07", "Sneha Kulkarni (food technologist)", T, [PU, RB],
    ["retort process", "clean-label preservation", "infant-safe recipes", "shelf-life planning"],
    [A, C], None, None, [], "Pune", "low",
    [o("2026-05", PU, "went_ahead", "Fruit purée made shelf-stable without preservatives")])
add("T08", "Farhan Qureshi (food technologist)", T, [HF, RB, BK],
    ["bar reformulation", "fibre fortification", "nutrition labelling"],
    [A], None, None, [], "Hyderabad", "low",
    [o("2026-01", HF, "went_ahead", "Raised fibre to 10 g per bar"),
     o("2026-09", HF, "accepted", "Intro accepted for an oats bar")])
add("T09", "Kavya Iyer (food technologist)", T, [CO, FB],
    ["coffee blending", "cold brew process", "adaptogen dosing", "sensory testing"],
    [A, C], None, None, [], "Bangalore", "medium",
    [o("2026-07", CO, "went_ahead", "Mushroom coffee blend finalised")])
add("T10", "Deepak Menon (food technologist)", T, [CH, CD],
    ["cheese making", "culture selection", "small-batch dairy"],
    [C], None, None, [], "Kochi", "medium",
    [o("2026-04", CH, "went_ahead", "Paneer yield improved by 8%"),
     o("2026-10", CD, "declined", "Brand was in Delhi and wanted in-person trials")])
add("T11", "Neha Bansal (food technologist)", T, [BK, SF, FC],
    ["eggless baking", "sugar reduction", "regulatory review"],
    [A, C], None, None, [], "Delhi NCR", "full",
    [o("2026-08", BK, "went_ahead", "Eggless brownie recipe locked")])
add("T12", "Siddharth Pillai (food technologist)", T, [RB, PS, PU],
    ["extrusion", "ready-to-eat formats", "retort process", "scale-up planning"],
    [A], None, None, [], "Chennai", "medium")

# ---------------- Labs (9) ----------------
L = "lab"
add("L01", "Sampoorna Testing Labs", L, [PS, HF, BK, RB, FC],
    ["shelf-life study", "nutrition analysis", "microbial testing", "texture analysis"],
    [A], None, None, ["NABL-accredited", "FSSAI-notified"], "Bangalore", "medium",
    [o("2026-03", HF, "went_ahead", "Accelerated shelf-life study, 6 weeks"),
     o("2026-08", PS, "went_ahead", "Protein claim verified")])
add("L02", "Kaveri Analytical", L, [CD, CH, SF, FB],
    ["microbial testing", "shelf-life study", "challenge testing", "nutrition analysis"],
    [A, C, F], None, None, ["NABL-accredited", "FSSAI-notified"], "Bangalore", "full",
    [o("2026-06", CD, "went_ahead", "Chilled shelf-life study for yoghurt"),
     o("2026-10", CH, "declined", "Queue was 5 weeks long")])
add("L03", "Western Food Sciences Lab", L, [FB, CO, PU, RB],
    ["nutrition analysis", "caffeine testing", "heavy metals", "shelf-life study"],
    [A, C], None, None, ["NABL-accredited"], "Mumbai", "low",
    [o("2026-05", CO, "went_ahead", "Caffeine level confirmed for label")])
add("L04", "Deccan Quality Labs", L, [PS, HF, BK, RB, SF],
    ["nutrition analysis", "allergen testing", "microbial testing"],
    [A], None, None, ["NABL-accredited", "FSSAI-notified"], "Hyderabad", "low",
    [o("2026-02", BK, "went_ahead", "Gluten-free claim tested")])
add("L05", "Coastal Micro Labs", L, [CH, CD, PU],
    ["microbial testing", "challenge testing"],
    [C, F], None, None, ["FSSAI-notified"], "Chennai", "medium",
    [o("2026-07", PU, "didnt_work", "Report format was rejected by retailer")])
add("L06", "North Star Food Testing", L, [SF, FC, BK, FB],
    ["nutrition analysis", "sugar profiling", "shelf-life study", "sensory panel"],
    [A, C, F], None, None, ["NABL-accredited", "FSSAI-notified"], "Delhi NCR", "medium",
    [o("2026-04", SF, "went_ahead", "Sugar-free claim verified"),
     o("2026-09", FC, "went_ahead", "Shelf-life at 25 °C confirmed")])
add("L07", "Sahyadri Sensory & Shelf Life", L, [PS, HF, CO, FB, RB],
    ["sensory panel", "shelf-life study", "texture analysis"],
    [A], None, None, ["FSSAI-notified"], "Pune", "low",
    [o("2026-06", HF, "accepted", "Intro accepted for a sensory test")])
add("L08", "Malabar Bio Testing", L, [PU, FB, CO],
    ["microbial testing", "pesticide residue", "nutrition analysis"],
    [A], None, None, ["NABL-accredited"], "Kochi", "low")
add("L09", "Mysore Dairy Research Lab", L, [CD, CH],
    ["dairy microbiology", "shelf-life study", "fat and protein analysis"],
    [C], None, None, ["NABL-accredited", "FSSAI-notified"], "Mysuru", "medium",
    [o("2026-08", CD, "went_ahead", "Probiotic count verified for label")])

# ---------------- Ingredient suppliers (11) ----------------
I = "ingredient-supplier"
add("I01", "Prana Proteins", I, [PS, HF, FB],
    ["whey protein", "pea protein", "protein crisps"],
    [A], 50, 20000, ["FSSAI licence", "ISO 22000"], "Bangalore", "low",
    [o("2026-03", PS, "went_ahead", "Supplied pea protein crisps"),
     o("2026-07", HF, "went_ahead", "Supplied whey for a bar")])
add("I02", "Fibrewell Ingredients", I, [HF, BK, RB],
    ["inulin", "oat fibre", "resistant dextrin"],
    [A], 100, 50000, ["FSSAI licence", "ISO 22000"], "Ahmedabad", "low",
    [o("2026-02", HF, "went_ahead", "Inulin for a fibre bar")])
add("I03", "Sweetleaf Naturals", I, [SF, FC, FB, CO],
    ["stevia", "monk fruit", "erythritol", "sweetener blends"],
    [A], 25, 10000, ["FSSAI licence"], "Pune", "medium",
    [o("2026-04", SF, "went_ahead", "Sweetener blend for sugar-free mousse"),
     o("2026-09", FC, "didnt_work", "Aftertaste the brand didn't like")])
add("I04", "Cocoa Coast Trading", I, [FC, BK],
    ["couverture chocolate", "compound chocolate", "sugar-free chocolate", "fillings"],
    [A], 100, 30000, ["FSSAI licence", "ISO 22000"], "Kochi", "medium",
    [o("2026-05", FC, "went_ahead", "Sugar-free couverture supplied")])
add("I05", "Milkway Cultures", I, [CD, CH],
    ["dairy cultures", "probiotic cultures", "rennet"],
    [C, F], 10, 5000, ["FSSAI licence", "ISO 22000"], "Bangalore", "low",
    [o("2026-06", CD, "went_ahead", "Cultures for high-protein curd")])
add("I06", "Orchard Pulp Co.", I, [PU, FB, SF],
    ["fruit pulps", "vegetable purées", "aseptic packs"],
    [A, F], 200, 40000, ["FSSAI licence", "BRC"], "Chennai", "medium",
    [o("2026-05", PU, "went_ahead", "Mango pulp for a baby purée")])
add("I07", "Grainsmith Millets", I, [BK, RB, HF, PS],
    ["millet flours", "puffed grains", "rolled oats"],
    [A], 50, 25000, ["FSSAI licence"], "Hyderabad", "low",
    [o("2026-01", RB, "went_ahead", "Puffed millets for a breakfast cup")])
add("I08", "Bean & Bloom Coffee Traders", I, [CO],
    ["green coffee", "roasted coffee", "instant coffee base"],
    [A], 50, 10000, ["FSSAI licence"], "Bangalore", "low",
    [o("2026-07", CO, "went_ahead", "Roasted arabica for a functional blend")])
add("I09", "Herbal Roots Extracts", I, [FB, CO, PS],
    ["ashwagandha extract", "mushroom extracts", "electrolyte premix"],
    [A], 5, 2000, ["FSSAI licence", "ISO 22000"], "Mysuru", "medium",
    [o("2026-06", FB, "went_ahead", "Ashwagandha extract supplied"),
     o("2026-10", CO, "accepted", "Lion's mane extract samples sent")])
add("I10", "Clean Label Additives", I, [BK, RB, PU, SF],
    ["natural emulsifiers", "citrus fibre", "natural preservatives"],
    [A], 25, 8000, ["FSSAI licence"], "Mumbai", "medium",
    [o("2026-08", BK, "declined", "Couldn't meet the 25 kg trial order")])
add("I11", "Nutsy Bulk Foods", I, [PS, HF, FC],
    ["nut butters", "roasted nuts", "date paste"],
    [A], 50, 15000, ["FSSAI licence"], "Delhi NCR", "low",
    [o("2026-03", HF, "went_ahead", "Date paste for a bar binder")])

# ---------------- Pilot facilities (7) ----------------
PF = "pilot-facility"
add("P01", "Bengaluru Food Incubation Centre", PF, [PS, HF, BK, RB],
    ["bar forming", "baking", "extrusion", "flow wrap"],
    [A], 20, 300, ["FSSAI licence"], "Bangalore", "medium",
    [o("2026-03", HF, "went_ahead", "200 kg bar pilot run"),
     o("2026-08", PS, "went_ahead", "Protein crisp pilot")])
add("P02", "Agri Pilot Plant, Mysuru", PF, [CD, CH, PU],
    ["pasteurisation", "curd setting", "cheese vats", "pulping"],
    [C, A], 50, 500, ["FSSAI licence"], "Mysuru", "full",
    [o("2026-06", CD, "went_ahead", "Curd pilot, 300 L"),
     o("2026-10", CH, "declined", "Booked until January")])
add("P03", "Pune Beverage Pilot Lab", PF, [FB, CO],
    ["hot fill", "cold brew", "carbonation", "can seaming"],
    [A, C], 50, 1000, ["FSSAI licence", "ISO 22000"], "Pune", "low",
    [o("2026-05", FB, "went_ahead", "500 L pilot of a functional drink")])
add("P04", "Hyderabad Bakery Pilot Kitchen", PF, [BK, SF, FC],
    ["baking", "enrobing", "tempering", "depositing"],
    [A, C], 10, 200, ["FSSAI licence"], "Hyderabad", "low",
    [o("2026-04", FC, "went_ahead", "Filled chocolate pilot, 80 kg")])
add("P05", "Chennai Retort Pilot Unit", PF, [RB, PU],
    ["retort pouch", "aseptic filling", "pulping"],
    [A], 50, 600, ["FSSAI licence", "ISO 22000"], "Chennai", "medium",
    [o("2026-05", PU, "went_ahead", "Retort purée pilot"),
     o("2026-09", RB, "didnt_work", "Upma texture broke down in retort")])
add("P06", "Mumbai Cold Kitchen Pilot", PF, [SF, CD],
    ["frozen dessert mixing", "batch freezing", "cups and tubs"],
    [C, F], 20, 300, ["FSSAI licence"], "Mumbai", "medium",
    [o("2026-07", SF, "went_ahead", "Sugar-free ice cream pilot")])
add("P07", "Delhi Snack Pilot Works", PF, [PS, RB, HF],
    ["extrusion", "roasting", "seasoning", "pouch filling"],
    [A], 30, 400, ["FSSAI licence"], "Delhi NCR", "low")

# ---------------- Contract manufacturers (15) ----------------
M = "manufacturer"
add("M01", "Southern Bars & Bites", M, [PS, HF],
    ["bar forming", "enrobing", "flow wrap"],
    [A], 500, 20000, ["FSSAI licence", "ISO 22000"], "Bangalore", "medium",
    [o("2026-04", HF, "went_ahead", "First batch of 1,000 kg"),
     o("2026-09", PS, "went_ahead", "Repeat order")])
add("M02", "Nilgiri Snack Foods", M, [PS, RB],
    ["extrusion", "roasting", "pouch filling"],
    [A], 1000, 50000, ["FSSAI licence", "BRC"], "Coimbatore", "low",
    [o("2026-06", PS, "declined", "Batch too small for their line")])
add("M03", "Vista Bakes", M, [BK, SF],
    ["baking", "eggless baking", "flow wrap"],
    [A], 300, 15000, ["FSSAI licence", "ISO 22000"], "Bangalore", "full",
    [o("2026-03", BK, "went_ahead", "Millet cookies, 600 kg"),
     o("2026-10", BK, "declined", "Line fully booked")])
add("M04", "Konkan Chocolate Works", M, [FC],
    ["tempering", "shell moulding", "filled chocolates", "foil wrap"],
    [A], 200, 8000, ["FSSAI licence", "ISO 22000"], "Mumbai", "medium",
    [o("2026-05", FC, "went_ahead", "Filled bonbons, 300 kg"),
     o("2026-09", FC, "didnt_work", "Filling leaked after 3 weeks")])
add("M05", "Rajhans Dairy Products", M, [CD, CH],
    ["pasteurisation", "curd and yoghurt", "paneer", "cup filling"],
    [C], 2000, 50000, ["FSSAI licence", "ISO 22000"], "Delhi NCR", "medium",
    [o("2026-07", CD, "declined", "Minimum run is 2,000 L")])
add("M06", "Sahyadri Dairy Co-op Unit", M, [CD],
    ["pasteurisation", "flavoured milk", "curd and yoghurt"],
    [C], 1000, 30000, ["FSSAI licence"], "Pune", "low",
    [o("2026-08", CD, "went_ahead", "High-protein yoghurt, 1,500 L")])
add("M07", "Aurora Beverages", M, [FB],
    ["hot fill", "PET bottling", "can filling", "carbonation"],
    [A], 1000, 100000, ["FSSAI licence", "ISO 22000", "BRC"], "Hyderabad", "medium",
    [o("2026-06", FB, "went_ahead", "Electrolyte drink, 5,000 L")])
add("M08", "Brewline Coffee Packers", M, [CO],
    ["instant coffee blending", "sachet packing", "cold brew bottling"],
    [A, C], 300, 10000, ["FSSAI licence"], "Bangalore", "low",
    [o("2026-07", CO, "went_ahead", "Mushroom coffee sachets, 400 kg")])
add("M09", "Tamil Retort Foods", M, [RB, PU],
    ["retort pouch", "ready-to-eat meals", "aseptic filling"],
    [A], 500, 40000, ["FSSAI licence", "BRC", "ISO 22000"], "Chennai", "medium",
    [o("2026-05", PU, "went_ahead", "Baby purée in pouches, 800 kg"),
     o("2026-09", RB, "went_ahead", "Ready-to-eat poha cups")])
add("M10", "Freezewell Desserts", M, [SF],
    ["frozen desserts", "ice cream", "cups and sticks"],
    [F], 500, 20000, ["FSSAI licence"], "Mumbai", "full",
    [o("2026-08", SF, "declined", "No freezer space until next year")])
add("M11", "Golden Oven Industries", M, [BK, RB],
    ["baking", "rusk", "granola", "flow wrap"],
    [A], 1000, 60000, ["FSSAI licence", "BRC"], "Delhi NCR", "low",
    [o("2026-04", RB, "went_ahead", "Granola, 2,000 kg")])
add("M12", "Fresh Fields Purée Co.", M, [PU, FB],
    ["pulping", "cold-pressed juice", "HPP"],
    [C, A], 500, 20000, ["FSSAI licence", "ISO 22000"], "Bangalore", "medium",
    [o("2026-06", PU, "went_ahead", "Cold-pressed fruit purée, 600 kg")])
add("M13", "Kerala Spice & Snack Co.", M, [PS, BK],
    ["roasting", "seasoning", "pouch filling", "baking"],
    [A], 300, 12000, ["FSSAI licence"], "Kochi", "low",
    [o("2026-02", PS, "didnt_work", "Seasoning coverage was uneven")])
add("M14", "Gujarat Nutrition Foods", M, [HF, PS, RB],
    ["bar forming", "extrusion", "powder blending"],
    [A], 2000, 80000, ["FSSAI licence", "ISO 22000", "BRC"], "Ahmedabad", "low",
    [o("2026-05", HF, "went_ahead", "Fibre bars, 5,000 kg")])
add("M15", "Hosur Chocolate & Confections", M, [FC, SF],
    ["enrobing", "filled bars", "sugar-free confectionery"],
    [A], 500, 15000, ["FSSAI licence", "ISO 22000"], "Bangalore", "medium",
    [o("2026-07", FC, "went_ahead", "Sugar-free filled bars, 700 kg")])

# ---------------- Packaging (6) ----------------
K = "packaging"
add("K01", "FlexiPack Solutions", K, [PS, HF, BK, RB, CO],
    ["flow wrap film", "stand-up pouches", "sachets", "low MOQ printing"],
    [A], 100, 50000, ["FSSAI licence", "ISO 22000"], "Bangalore", "low",
    [o("2026-04", HF, "went_ahead", "Printed bar wrappers, low MOQ")])
add("K02", "Coldchain Cups & Tubs", K, [CD, CH, SF],
    ["cups", "tubs", "foil lids", "frozen-safe packs"],
    [C, F], 500, 50000, ["FSSAI licence"], "Pune", "medium",
    [o("2026-07", CD, "went_ahead", "Printed yoghurt cups")])
add("K03", "Ecobox Packaging", K, [BK, FC, RB],
    ["paper cartons", "gift boxes", "compostable trays"],
    [A], 200, 30000, ["FSSAI licence"], "Mumbai", "medium",
    [o("2026-09", FC, "accepted", "Gift box samples requested")])
add("K04", "Retortech Pouches", K, [RB, PU],
    ["retort pouches", "spouted pouches"],
    [A], 500, 100000, ["FSSAI licence", "BRC"], "Chennai", "low",
    [o("2026-05", PU, "went_ahead", "Spouted purée pouches")])
add("K05", "Bottle & Can Supply Co.", K, [FB, CO],
    ["PET bottles", "glass bottles", "aluminium cans"],
    [A, C], 1000, 200000, ["FSSAI licence", "ISO 22000"], "Hyderabad", "low",
    [o("2026-06", FB, "went_ahead", "Printed cans")])
add("K06", "Small Run Labels & Packs", K, [PS, HF, BK, FC, CO, SF],
    ["digital printed pouches", "labels", "low MOQ printing"],
    [A, C], 20, 2000, ["FSSAI licence"], "Bangalore", "medium",
    [o("2026-08", PS, "went_ahead", "300 printed pouches for samples"),
     o("2026-10", CO, "went_ahead", "Sachet labels")])

assert len(P) == 60, len(P)
assert len({p["id"] for p in P}) == 60
json.dump({"note": "Sample data, not First Batch's real network. All names are made up.",
           "partners": P}, open(sys.argv[1] if len(sys.argv) > 1 else "src/data/partners.json", "w"), indent=2, ensure_ascii=False)
print("ok", len(P))
