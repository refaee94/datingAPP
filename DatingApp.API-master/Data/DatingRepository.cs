using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext context;

        public DatingRepository(DataContext context)
        {
            this.context = context;
        }

        public void Add<T>(T entity) where T : class
        {
            this.context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            this.context.Remove(entity);
        }

        public async Task<Photo> GetPhotoAsync(int id)
        {
            var photo = await this.context.Photos.FirstOrDefaultAsync(p => p.Id == id);

            return photo;
        }

        public async Task<Photo> GetMainPhotoForUserAsnyc(int userId)
        {
            var photo = await this.context.Photos.Where(p => p.UserId == userId).FirstOrDefaultAsync(p => p.IsMain == true);
            return photo;
        }

        public async Task<User> GetUserAsync(int id)
        {
            var user = await this.context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Id == id);
            return user;
        }

        public async Task<PagedList<User>> GetUsersAsync(UserParams userParams)
        {
            var users = this.context.Users.Include(u => u.Photos)
                .Where(u => u.Gender == userParams.Gender && u.Id != userParams.UserId).OrderByDescending(u => u.LastActive).AsQueryable();

            if (userParams.Likers)
            {
                var userLikers = await this.GetUserLikes(userParams.UserId, userParams.Likers);

                users = users.Where(u => userLikers.Any(liker => liker.LikerId == u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await this.GetUserLikes(userParams.UserId, userParams.Likers);

                users = users.Where(u => userLikees.Any(likee => likee.LikeeId == u.Id));
            }
            if (userParams.MinAge != UserParams.DEFUALT_MIN_AGE || userParams.MaxAge != UserParams.DEFUALT_MAX_AGE)
            {
                var min = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var max = DateTime.Today.AddYears(-userParams.MinAge);
                users = users.Where(
                    u => u.DateOfBirth >= min && u.DateOfBirth <= max
                    );
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created); break;

                    default:
                        break;
                }
            }

            return await PagedList<User>.CreateAsync(users, userParams.PageSize, userParams.PageNumber);
        }

        private async Task<IEnumerable<Like>> GetUserLikes(int id, bool Likers)
        {
            var user = await this.context.Users
            .Include(u => u.Likee)
            .Include(u => u.Liker)
            .FirstOrDefaultAsync(u => u.Id == id);

            if (Likers)
            {
                return user.Likee.Where(u => u.LikeeId == id);
            }
            else
            {
                return user.Liker.Where(u => u.LikerId == id);
            }
        }

        public async Task<bool> SaveAll()
        {
            return await this.context.SaveChangesAsync() > 0;
        }

        public async Task<Like> GetLike(int likerId, int likeeId)
        {
            return await this.context.Likes.FirstOrDefaultAsync(l => l.LikeeId == likeeId && l.LikerId == likerId);
        }

        public async Task<Message> GetMessageAsync(int id)
        {
            return await this.context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<Message>> GetMessagesForUserAsync(MessageParams messageParams)
        {
            var messages = this.context.Messages.Include(m => m.Sender).ThenInclude(s => s.Photos)
            .Include(m => m.Recipient).ThenInclude(r => r.Photos).AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(m => m.RecipientId == messageParams.UserId && m.RecipientDeleted == false); break;
                case "Outbox":
                    messages = messages.Where(m => m.SenderId == messageParams.UserId && m.SenderDeleted == false); break;
                default:
                    messages = messages.Where(m => m.RecipientId == messageParams.UserId && !m.IsRead && m.RecipientDeleted == false); break;
            }

            messages.OrderByDescending(m => m.DateSent);
            return await PagedList<Message>.CreateAsync(messages, messageParams.PageSize, messageParams.PageNumber);
        }

        public async Task<IEnumerable<Message>> GetMessageThreadAsync(int userId, int recipientId)
        {
            var messages = await this.context.Messages.Include(m => m.Sender).ThenInclude(s => s.Photos)
            .Include(m => m.Recipient).ThenInclude(r => r.Photos)
            .Where(m => (m.RecipientId == userId && m.SenderId == recipientId && m.RecipientDeleted == false)
            || (m.SenderId == userId && m.RecipientId == recipientId && m.SenderDeleted == false))
            .OrderByDescending(m => m.DateSent)
            .ToListAsync();

            return messages;
        }
    }
}