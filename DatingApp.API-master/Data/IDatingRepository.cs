using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T: class;
        void Delete<T>(T entity) where T: class;
        Task<bool> SaveAll();
        Task<User> GetUserAsync(int id);
        Task<PagedList<User>> GetUsersAsync(UserParams userParams);
        Task<Photo> GetPhotoAsync(int id);

        Task<Photo> GetMainPhotoForUserAsnyc(int userId);

        Task<Like> GetLike(int likerId, int likeeId);
        Task<Message> GetMessageAsync(int id);
        Task<PagedList<Message>> GetMessagesForUserAsync(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessageThreadAsync(int userId, int recipientId);

    }
}