﻿using Billing.Impl;
using Common;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Notes;
using DatabaseContext.Repositories.Notes;
using Mapper.Mapping;
using MediatR;
using Notes.Commands;

namespace Notes.Handlers.Commands;

public class NewPrivateNoteCommandHandler : IRequestHandler<NewPrivateNoteCommand, OperationResult<SmallNote>>
{
    private readonly NoteRepository noteRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly BillingPermissionService billingPermissionService;

    public NewPrivateNoteCommandHandler(
        NoteRepository noteRepository, 
        NoteFolderLabelMapper appCustomMapper,
        BillingPermissionService billingPermissionService)
    {
        this.noteRepository = noteRepository;
        this.appCustomMapper = appCustomMapper;
        this.billingPermissionService = billingPermissionService;
    }

    public async Task<OperationResult<SmallNote>> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
    {
        var isCanCreate = await billingPermissionService.CanCreateNoteAsync(request.UserId);
        if (!isCanCreate)
        {
            return new OperationResult<SmallNote>().SetBillingError();
        }
        
        var note = new Note()
        {
            UserId = request.UserId,
            Order = 1,
            Color = NoteColorPallete.Green,
            NoteTypeId = NoteTypeENUM.Private,
            RefTypeId = RefTypeENUM.Viewer,
            CreatedAt = DateTimeProvider.Time,
        };

        note.SetDateAndVersion();

        await noteRepository.AddAsync(note);
        note.LabelsNotes = new List<LabelsNotes>();

        var mappedNote = appCustomMapper.MapNoteToSmallNoteDTO(note, true, note.Order);
        return new OperationResult<SmallNote>(true, mappedNote);
    }
}