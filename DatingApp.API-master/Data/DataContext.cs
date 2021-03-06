using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<Value> Values { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Like>()
            .HasKey(l => new { l.LikerId, l.LikeeId });

            modelBuilder.Entity<Like>()
            .HasOne(l => l.Likee)
            .WithMany(u => u.Liker)
            .HasForeignKey(l => l.LikerId)
            .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Like>()
            .HasOne(l => l.Liker)
            .WithMany(l => l.Likee)
            .HasForeignKey(l => l.LikeeId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
            .HasOne(m => m.Recipient)
            .WithMany(r => r.MessagesReceived)
            .OnDelete(DeleteBehavior.Restrict);

        }
    }
}