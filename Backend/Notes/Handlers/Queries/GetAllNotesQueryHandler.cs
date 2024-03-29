﻿using Common.DTO.Notes;
using DatabaseContext.Repositories.Notes;
using MapperLocked;
using MediatR;
using Notes.Impl;
using Notes.Queries;

namespace Notes.Handlers.Queries;

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, List<SmallNote>>
{
    private readonly NoteRepository noteRepository;
    private readonly MapperLockedEntities mapperLockedEntities;
    private readonly NotesService notesService;

    public GetAllNotesQueryHandler(
        NoteRepository noteRepository, 
        MapperLockedEntities mapperLockedEntities,
        NotesService notesService)
    {
        this.noteRepository = noteRepository;
        this.mapperLockedEntities = mapperLockedEntities;
        this.notesService = notesService;
    }
    
    public async Task<List<SmallNote>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await noteRepository.GetNotesByUserId(request.UserId, request.TakeContents);
        var sharedNotes = await notesService.GetSharedNotes(request.UserId, request.TakeContents);
        notes.AddRange(sharedNotes);
        notes = notes.DistinctBy(x => x.Id).ToList();

        notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.OrderBy(x => x.AddedAt).ToList());
        notes = notes.OrderBy(x => x.Order).ToList();

        return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
    }
}