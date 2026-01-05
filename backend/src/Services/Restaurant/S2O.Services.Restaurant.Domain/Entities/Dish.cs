using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Restaurant.Domain.Entities
{
    public class Dish : Entity<Guid>
    {
        public string Name { get; private set; } = default!;
        public decimal Price { get; private set; }
        public string? Description { get; private set; }
        public string? ImageUrl { get; private set; }
        public bool IsAvailable { get; private set; }

        public Guid RestaurantId { get; private set; } // Multi-tenant key
        public Guid CategoryId { get; private set; }

        private Dish() { }

        public static Dish Create(Guid restaurantId, Guid categoryId, string name, decimal price, string? desc, string? img)
        {
            return new Dish
            {
                Id = Guid.NewGuid(),
                RestaurantId = restaurantId,
                CategoryId = categoryId,
                Name = name,
                Price = price,
                Description = desc,
                ImageUrl = img,
                IsAvailable = true
            };
        }

        public void Update(string name, decimal price, string? desc, string? img, bool isAvailable)
        {
            Name = name;
            Price = price;
            Description = desc;
            ImageUrl = img;
            IsAvailable = isAvailable;
        }
    }
}