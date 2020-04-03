using System;

namespace DatingApp.API.Dtos
{
    public class MessageForCreationDto
    {
        public MessageForCreationDto()
        {
            this.DateSent = DateTime.Now;
        }

        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public DateTime DateSent { get; set; }
        public string content { get; set; }
        
    }
}