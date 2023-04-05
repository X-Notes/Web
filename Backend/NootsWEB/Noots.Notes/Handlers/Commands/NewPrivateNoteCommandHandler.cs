using Common;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Mapper.Mapping;
using Noots.Notes.Commands;

namespace Noots.Notes.Handlers.Commands;

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
            UpdatedAt = DateTimeProvider.Time,
        };

        await noteRepository.AddAsync(note);
        note.LabelsNotes = new List<LabelsNotes>();

        var mappedNote = appCustomMapper.MapNoteToSmallNoteDTO(note, true, note.Order);
        return new OperationResult<SmallNote>(true, mappedNote);
    }
}