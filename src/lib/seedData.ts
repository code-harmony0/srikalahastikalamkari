// Sample seed data for initializing your database
export const categories = [
  {
    id: "1",
    name: "Kalamkari Sarees",
    slug: "kalamkari-sarees",
    parentId: null,
  },
  {
    id: "2",
    name: "Kalamkari Dress Materials",
    slug: "kalamkari-dress-materials",
    parentId: null,
  },
  {
    id: "3",
    name: "Kalamkari Kurtis",
    slug: "kalamkari-kurtis",
    parentId: null,
  },
  {
    id: "4",
    name: "Kalamkari Dupattas",
    slug: "kalamkari-dupattas",
    parentId: null,
  },
]

export const products = [
  // Add sample products here if needed
]

export const seedDatabase = async () => {
  // Add your database seeding logic here
  console.log("Seeding database...")
  // Example: await db.insert(categories).values(seedCategories);
}