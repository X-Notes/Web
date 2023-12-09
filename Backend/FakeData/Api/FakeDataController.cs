using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Users;
using Common.Filters;
using System;
using System.Linq;
using Bogus;
using Common;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO.Personalization;
using DatabaseContext.Repositories.NoteContent;
using DatabaseContext.Repositories.Notes;
using DatabaseContext.Repositories.Users;
using Editor.Commands.Structure;
using Editor.Commands.Text;
using Editor.Entities;
using Editor.Queries;
using MediatR;
using Notes.Queries;

namespace FakeData.Api;

[Route("api/[controller]")]
[ApiController]
[ServiceFilter(typeof(DisableInProductionFilter))]
public class FakeDataController : ControllerBase
{
    private readonly UserRepository userRepository;
    private readonly NoteRepository noteRepository;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly IMediator mediator;

    public FakeDataController(
        UserRepository userRepository, 
        NoteRepository noteRepository, 
        BaseNoteContentRepository baseNoteContentRepository,
        IMediator mediator)
    {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.mediator = mediator;
    }

    
    [HttpPost("users/{count}")]
    public async Task<IActionResult> SetUsers(int count)
    {
        var userGenerator = new UserGenerator();
        await userRepository.AddRangeAsync(userGenerator.GetUsers(count));
        return Ok("ok");
    }
    
    [HttpPost("users-notes/{count}")]
    public async Task<IActionResult> SetUsersWithNotes(int count)
    {
        var userGenerator = new UserGenerator();
        foreach (var user in userGenerator.GetUsers(count))
        {
            await userRepository.AddAsync(user);
            await SetContentsAsync(user.Id, count, 10, 200);
        }
        return Ok("ok");
    }
    
    [HttpPost("set/notes/{count}/{userId}")]
    public async Task<IActionResult> SetNotes(int count, Guid userId)
    {
        await SetContentsAsync(userId, count, 10, 200);
        return Ok("ok");
    }
    
    [HttpPatch("sync/structure/{userId}")]
    public async Task<OperationResult<NoteStructureResult>> SyncNoteStructure(SyncNoteStructureCommand command, Guid userId)
    {
        command.UserId = userId;
        return await mediator.Send(command);
    }

    private async Task SetContentsAsync(Guid userId, int notesCount, int contentFrom, int contentTo)
    {
        var faker = new Faker();
        
        var noteGenerator = new NoteGenerator(userId);
        var notes = noteGenerator.GetNotes(notesCount);
        await noteRepository.AddRangeAsync(notes);

        var baseContentGenerator = new BaseContentNoteGenerator();
        var contents = notes.SelectMany(x =>
        {
            return baseContentGenerator.GetContents(faker.Random.Int(contentFrom, contentTo), x.Id);
        });

        await baseNoteContentRepository.AddRangeAsync(contents);
    }

    [HttpGet("notes/{userId}/{typeId}")]
    public async Task<List<SmallNote>> GetNotesAsync(Guid userId, NoteTypeENUM typeId, PersonalizationSettingDTO settings)
    {
        settings ??= new PersonalizationSettingDTO().GetDefault();
        
        var query = new GetNotesByTypeQuery(userId, typeId, settings);
        return await mediator.Send(query);
    }
    
    [HttpGet("contents/{userId}/{noteId}")]
    public async Task<OperationResult<List<BaseNoteContentDTO>>> GetNoteContents(Guid userId, Guid noteId)
    {
        var command = new GetNoteContentsQuery(userId, noteId);
        return await mediator.Send(command);
    }

    [HttpPatch("text/sync/{userId}")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<List<UpdateBaseContentResult>>> SyncTextContents(UpdateTextContentsCommand command, Guid userId)
    {
        command.UserId = userId;
        return await mediator.Send(command);
    }
}