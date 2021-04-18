using BI.services.notes;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.app;
using Common.DTO.labels;
using Common.DTO.notes;
using Common.DTO.notes.FullNoteContent;
using Common.DTO.notes.FullNoteContent.NoteContentTypeDict;
using System;
using System.Collections.Generic;
using System.Linq;


namespace BI.Mapping
{
    public class NoteCustomMapper
    {
        public FullNote MapNoteToFullNote(Note note)
        {
            var _fullNote = new FullNote()
            {
                Id = note.Id,
                Color = note.Color,
                NoteType = MapTypeToTypeDTO(note.NoteType),
                RefType = MapRefToRefDTO(note.RefType),
                Title = note.Title,
                Labels = MapLabelsToLabelsDTO(note.LabelsNotes.GetLabelUnDesc())
            };
            return _fullNote;
        }

        public List<BaseContentNoteDTO> MapContentsToContentsDTO(List<BaseNoteContent> Contents)
        {
            var resultList = new List<BaseContentNoteDTO>();
            
            foreach(var content in Contents)
            {
                switch (content)
                {
                    case TextNote tN:
                        {
                            var tNDTO = new TextNoteDTO(tN.Content, tN.Id, tN.TextType, tN.HeadingType, tN.Checked);
                            resultList.Add(tNDTO);
                            break;
                        }
                    case AlbumNote aN:
                        {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.ALBUM);
                            var photosDTO = aN.Photos.Select(item => new AlbumPhotoDTO(item.Id)).ToList();
                            var aNDTO = new AlbumNoteDTO(photosDTO, aN.Width, aN.Height, aN.Id, type, aN.CountInRow);
                            resultList.Add(aNDTO);
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
            }
            return resultList;
        }

        public NoteTypeDTO MapTypeToTypeDTO(NoteType type)
        {
            return new NoteTypeDTO(type.Id, type.Name);
        }

        public RefTypeDTO MapRefToRefDTO(RefType type)
        {
            return new RefTypeDTO(type.Id, type.Name);
        }

        public List<LabelDTO> MapLabelsToLabelsDTO(List<LabelsNotes> labelsNotes)
        {
            var count = labelsNotes.Count();
            return labelsNotes.Select(x => MapLabelToLabelDTO(x, count)).ToList();
        }

        public LabelDTO MapLabelToLabelDTO(LabelsNotes label, int count)
        {
            var lb = label.Label;
            return new LabelDTO()
            {
                Id = lb.Id,
                Name = lb.Name,
                Color = lb.Color,
                CountNotes = count,
                IsDeleted = lb.IsDeleted
            };
        }

        public RelatedNote MapNoteToRelatedNoteDTO((Note note, bool isOpened) tuple, int? takeContentLength = null)
        {
            return new RelatedNote()
            {
                Id = tuple.note.Id,
                Color = tuple.note.Color,
                Title = tuple.note.Title,
                IsOpened = tuple.isOpened,
                Labels = MapLabelsToLabelsDTO(tuple.note.LabelsNotes.GetLabelUnDesc()),
                NoteType = tuple.note.NoteType != null ? MapTypeToTypeDTO(tuple.note.NoteType) : null,
                RefType = tuple.note.RefType != null ? MapRefToRefDTO(tuple.note.RefType) : null,
                Contents = takeContentLength.HasValue ? 
                MapContentsToContentsDTO(tuple.note.Contents).Take(takeContentLength.Value).ToList() :
                MapContentsToContentsDTO(tuple.note.Contents).ToList()
            };
        }

        public SmallNote MapNoteToSmallNoteDTO(Note note, int? takeContentLength = null)
        {
            return new SmallNote()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Labels = MapLabelsToLabelsDTO(note.LabelsNotes.GetLabelUnDesc()),
                NoteType = note.NoteType != null ? MapTypeToTypeDTO(note.NoteType) : null,
                RefType = note.RefType != null ? MapRefToRefDTO(note.RefType) : null,
                Contents = takeContentLength.HasValue ?
                MapContentsToContentsDTO(note.Contents).Take(takeContentLength.Value).ToList() :
                MapContentsToContentsDTO(note.Contents).ToList()
            };
        }

        public PreviewNoteForSelection MapNoteToPreviewNoteDTO(Note note, IEnumerable<Guid> ids , int? takeContentLength = null)
        {
            return new PreviewNoteForSelection()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Labels = MapLabelsToLabelsDTO(note.LabelsNotes.GetLabelUnDesc()),
                NoteType = note.NoteType != null ? MapTypeToTypeDTO(note.NoteType) : null,
                RefType = note.RefType != null ? MapRefToRefDTO(note.RefType) : null,
                Contents = takeContentLength.HasValue ?
                MapContentsToContentsDTO(note.Contents).Take(takeContentLength.Value).ToList() :
                MapContentsToContentsDTO(note.Contents).ToList(),
                IsSelected = ids.Contains(note.Id)
            };
        }

        public List<PreviewNoteForSelection> MapNotesToPreviewNotesDTO(List<Note> notes, IEnumerable<Guid> ids, int? takeContentLength = null)
        {
            return notes.Select((note) => MapNoteToPreviewNoteDTO(note, ids, takeContentLength)).ToList();
        }

        public List<SmallNote> MapNotesToSmallNotesDTO(IEnumerable<Note> notes, int? takeContentLength = null)
        {
            return notes.Select(note => MapNoteToSmallNoteDTO(note, takeContentLength)).ToList();
        }

        public List<RelatedNote> MapNotesToRelatedNotes(List<ReletatedNoteToInnerNote> notes, int? takeContentLength = null)
        {
            var resultList = new List<(Note, bool)>();
            notes.ForEach(note => resultList.Add((note.RelatedNote, note.IsOpened)));
            return resultList.Select(tuple => MapNoteToRelatedNoteDTO(tuple, takeContentLength)).ToList();
        }
    }
}
