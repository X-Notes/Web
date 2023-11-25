using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Users;
using Common.Filters;
using System;
using System.Linq;
using Bogus;
using DatabaseContext.Repositories.NoteContent;
using DatabaseContext.Repositories.Notes;
using DatabaseContext.Repositories.Users;

namespace FakeData.Api;

[Route("api/[controller]")]
[ApiController]
[ServiceFilter(typeof(DisableInProductionFilter))]
public class FakeDataController : ControllerBase
{
    private readonly UserRepository userRepository;
    private readonly NoteRepository noteRepository;
    private readonly BaseNoteContentRepository baseNoteContentRepository;

    public FakeDataController(UserRepository userRepository, NoteRepository noteRepository, BaseNoteContentRepository baseNoteContentRepository)
    {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.baseNoteContentRepository = baseNoteContentRepository;
    }

    [HttpGet("get/users/{count}")]
    public List<User> GetUsers(int count)
    {
        var userGenerator = new UserGenerator();
        return userGenerator.GetUsers(count);
    }

    [HttpGet("set/users/{count}")]
    public async Task<IActionResult> SetUsers(int count)
    {
        var userGenerator = new UserGenerator();
        await userRepository.AddRangeAsync(userGenerator.GetUsers(count));
        return Ok("ok");
    }


    [HttpGet("set/notes/{count}/{userId}")]
    public async Task<IActionResult> SetNotes(int count, Guid userId)
    {
        var faker = new Faker();

        var noteGenerator = new NoteGenerator(userId);
        var notes = noteGenerator.GetNotes(count);
        await noteRepository.AddRangeAsync(notes);

        var baseContentGenerator = new BaseContentNoteGenerator();
        var contents = notes.SelectMany(x =>
        {
            return baseContentGenerator.GetContents(faker.Random.Int(10, 1000), x.Id);
        });

        await baseNoteContentRepository.AddRangeAsync(contents);

        return Ok("ok");
    }
}