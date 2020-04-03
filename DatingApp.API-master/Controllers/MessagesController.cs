using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        public MessagesController(IDatingRepository datingRepository, IMapper mapper)
        {
            this.mapper = mapper;
            this.datingRepository = datingRepository;
        }

        [HttpGet("{id}", Name = "GetMessage")]
        public async Task<Message> GetMessage(int id)
        {
            return await this.datingRepository.GetMessageAsync(id);
        }

        [HttpGet("thread/{id}")]
        public async Task<IActionResult> GetMessgesThread(int userId, int id){
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)){
                return Unauthorized();
            }
            
            var messagesThread = await this.datingRepository.GetMessageThreadAsync(userId, id);

            var messageThreadForReturn = this.mapper.Map<IEnumerable<MessageForReturnDto>>(messagesThread);

            return Ok(messageThreadForReturn);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesForUser(int userId, MessageParams messageParams)
        {

            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var messages = await this.datingRepository.GetMessagesForUserAsync(messageParams);
            var messagesForReturn = this.mapper.Map<IEnumerable<MessageForReturnDto>>(messages);
            Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages);
            return Ok(messagesForReturn);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, [FromBody]MessageForCreationDto messageForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            messageForCreationDto.SenderId = userId;

            var recipient = await this.datingRepository.GetUserAsync(messageForCreationDto.RecipientId);

            var sender = await this.datingRepository.GetUserAsync(messageForCreationDto.SenderId);

            if (recipient == null)
            {
                return BadRequest("Could not find user");
            }

            var message = this.mapper.Map<Message>(messageForCreationDto);
            this.datingRepository.Add(message);

            var messageForReturn = this.mapper.Map<MessageForReturnDto>(message);

            if (await this.datingRepository.SaveAll())
            {
                return CreatedAtRoute("GetMessage", new { id = message.Id }, messageForReturn);
            }

            throw new Exception("Creating the message faild on save");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int userId,int id){
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var message = await this.datingRepository.GetMessageAsync(id);
            if(message.SenderId == userId){
                message.SenderDeleted = true;
            }

            if(message.RecipientId == userId){
                message.RecipientDeleted = true;
            }

            if(message.SenderDeleted && message.RecipientDeleted){
                this.datingRepository.Delete(message);
            }

            if(await this.datingRepository.SaveAll()){
                return NoContent();
            }

            throw new Exception("Error deleting the message");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MarkMessageAsRead(int userId, int id){
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var message = await this.datingRepository.GetMessageAsync(id);

            if(message.RecipientId != userId){
                return BadRequest("Failed to mark message as read");
            }

            message.IsRead = true;
            message.DateRead = DateTime.Now;

            await this.datingRepository.SaveAll();
            return NoContent();
        }

    }
}