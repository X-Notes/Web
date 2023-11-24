using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Mapper.Mapping;

namespace Noots.MapperLocked
{
    public class MapperLockedEntities
    {
        private readonly NoteFolderLabelMapper noteMapper;

        public MapperLockedEntities(NoteFolderLabelMapper noteMapper)
        {
            this.noteMapper = noteMapper;
        }

        public List<RelatedNote> MapNotesToRelatedNotes(List<RelatedNoteToInnerNote> notes, Guid callerId)
        {
            return notes.Select(note =>
            {
                var relatedNote = noteMapper.MapNoteToRelatedNoteDTO(note, callerId);
                relatedNote = noteMapper.SetContent(relatedNote);
                return relatedNote;
            }).ToList(); ;
        }

        public FullNote MapNoteToFullNote(Note note, bool isCanWrite)
        {
            var _fullNote = new FullNote()
            {
                Id = note.Id,
                Color = note.Color,
                NoteTypeId = note.NoteTypeId,
                RefTypeId = note.RefTypeId,
                UserId = note.UserId,
                Title = note.Title,
                IsCanEdit = isCanWrite,
                Labels = note.LabelsNotes != null ? noteMapper.MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                Version = note.Version
            };

            return _fullNote;
        }

        public List<PreviewNoteForSelection> MapNotesToPreviewNotesDTO(List<Note> notes, IEnumerable<Guid> ids)
        {
            return notes.Select(note =>
            {
                var m = noteMapper.MapNoteToPreviewNoteDTO(note, ids);
                m = noteMapper.SetContent(m);
                return m;
            }).ToList();
        }

        public List<SmallNote> MapNotesToSmallNotesDTO(IEnumerable<Note> notes, Guid callerId)
        {
            return notes.Select(note =>
            {
                var m = noteMapper.MapNoteToSmallNoteDTO(note, noteMapper.IsCanEdit(note, callerId), note.Order);
                m = noteMapper.SetContent(m);
                return m;
            }).ToList();
        }

        public List<SmallNote> MapFolderNotesToSmallNotesDTO(IEnumerable<Note> notes, Guid callerId, Dictionary<Guid, int> orders)
        {
            return notes.Select(note =>
            {
                var order = orders.ContainsKey(note.Id) ? orders[note.Id] : 0;
                var m = noteMapper.MapNoteToSmallNoteDTO(note, noteMapper.IsCanEdit(note, callerId), order);
                m = noteMapper.SetContent(m);
                return m;
            }).ToList();
        }
    }
}