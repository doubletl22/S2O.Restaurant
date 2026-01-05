using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Restaurant.Domain.Entities
{
    public class Category : Entity<Guid>
    {
        public string Name { get; private set; } = default!;
        public Guid RestaurantId { get; private set; } 

        private readonly List<Dish> _dishes = new();
        public IReadOnlyCollection<Dish> Dishes => _dishes.AsReadOnly();

        private Category() { }

        public Category(Guid restaurantId, string name)
        {
            Id = Guid.NewGuid();
            RestaurantId = restaurantId;
            Name = name;
        }

        public void Update(string name) => Name = name;
    }
}