using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class ValuesController : ControllerBase
    {
        public readonly DataContext _context;

        public ValuesController(DataContext context)
        {
            this._context = context;
        }
        // GET api/values
        [HttpGet]
        public async Task<ActionResult> GetValues()
        {
            return Ok( await _context.Values.ToListAsync());
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetValue(string id)
        {
            var vs = await _context.Values.FirstOrDefaultAsync(v => v.Id == id);
            return Ok(vs);
        }

        // POST api/values
        [HttpPost]
        public IActionResult Post([FromBody] string value)
        {
            Value v = new Value();
            v.Name = value;
            var e = _context.Values.Add(v);
            _context.SaveChanges();
            return Ok(v);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(string id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(string id)
        {
        }
    }
}
