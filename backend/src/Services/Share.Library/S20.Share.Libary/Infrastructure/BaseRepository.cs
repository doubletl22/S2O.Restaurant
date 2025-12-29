using Microsoft.EntityFrameworkCore;
using S20.Share.Libary.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace S20.Share.Libary.Infrastructure
{
    public class BaseRepository<T, TContext> : IBaseRepository<T> where T : class where TContext : DbContext
    {
        protected readonly TContext _context;
        protected readonly DbSet<T> _dbSet;
        public BaseRepository(TContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        public async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
        public void Update(T entity) => _dbSet.Update(entity);
        public void Delete(T entity) => _dbSet.Remove(entity);
        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate) => await _dbSet.AnyAsync(predicate);
    }
}
