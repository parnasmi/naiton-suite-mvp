import { CrmCompanySchema, type CrmCompany } from "@naiton/contracts";

const seedCompanies: CrmCompany[] = [
  {
    id: "cmp_001",
    name: "Meridian Supply",
    relationship_type: "Customer",
    account_manager: "Anora M.",
    tax_number: "TIN-113204",
    country: "Uzbekistan",
    city: "Tashkent",
    industry: "Distribution",
    is_active: true,
    created_at: "2026-02-10T10:00:00.000Z"
  },
  {
    id: "cmp_002",
    name: "Orion Trade LLC",
    relationship_type: "Customer",
    account_manager: "Dilshod A.",
    tax_number: "TIN-113205",
    country: "Uzbekistan",
    city: "Samarkand",
    industry: "Retail",
    is_active: true,
    created_at: "2026-02-14T08:30:00.000Z"
  },
  {
    id: "cmp_003",
    name: "Garnet Logistics",
    relationship_type: "Partner",
    account_manager: "Bekzod R.",
    tax_number: "TIN-113206",
    country: "Kazakhstan",
    city: "Almaty",
    industry: "Logistics",
    is_active: true,
    created_at: "2026-02-20T13:20:00.000Z"
  },
  {
    id: "cmp_004",
    name: "Lumen Electronics",
    relationship_type: "Customer",
    account_manager: "Anora M.",
    tax_number: "TIN-113207",
    country: "Kyrgyzstan",
    city: "Bishkek",
    industry: "Electronics",
    is_active: true,
    created_at: "2026-02-21T11:45:00.000Z"
  },
  {
    id: "cmp_005",
    name: "Atlas Retail",
    relationship_type: "Prospect",
    account_manager: "Bekzod R.",
    tax_number: "TIN-113208",
    country: "Uzbekistan",
    city: "Bukhara",
    industry: "Retail",
    is_active: false,
    created_at: "2026-03-01T09:10:00.000Z"
  },
  {
    id: "cmp_006",
    name: "Northbridge Ltd",
    relationship_type: "Customer",
    account_manager: "Dilshod A.",
    tax_number: "TIN-113209",
    country: "Uzbekistan",
    city: "Andijan",
    industry: "Manufacturing",
    is_active: true,
    created_at: "2026-03-03T15:50:00.000Z"
  },
  {
    id: "cmp_007",
    name: "Vector Foods",
    relationship_type: "Customer",
    account_manager: "Anora M.",
    tax_number: "TIN-113210",
    country: "Uzbekistan",
    city: "Namangan",
    industry: "Food",
    is_active: true,
    created_at: "2026-03-08T12:00:00.000Z"
  },
  {
    id: "cmp_008",
    name: "Nexus Industries",
    relationship_type: "Partner",
    account_manager: "Dilshod A.",
    tax_number: "TIN-113211",
    country: "Tajikistan",
    city: "Dushanbe",
    industry: "Industrial",
    is_active: true,
    created_at: "2026-03-09T10:35:00.000Z"
  },
  {
    id: "cmp_009",
    name: "Oceanic Imports",
    relationship_type: "Supplier",
    account_manager: "Bekzod R.",
    tax_number: "TIN-113212",
    country: "Turkey",
    city: "Istanbul",
    industry: "Import",
    is_active: true,
    created_at: "2026-03-12T09:45:00.000Z"
  },
  {
    id: "cmp_010",
    name: "Aster Medical",
    relationship_type: "Prospect",
    account_manager: "Anora M.",
    tax_number: "TIN-113213",
    country: "Uzbekistan",
    city: "Tashkent",
    industry: "Healthcare",
    is_active: false,
    created_at: "2026-03-15T16:15:00.000Z"
  }
];

export const crmCompanies = seedCompanies.map((company) => CrmCompanySchema.parse(company));
