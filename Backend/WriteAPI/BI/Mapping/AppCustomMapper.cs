using BI.services.notes;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.app;
using Common.DTO.folders;
using Common.DTO.labels;
using Common.DTO.notes;
using Common.DTO.notes.FullNoteContent;
using Common.DTO.notes.FullNoteContent.NoteContentTypeDict;
using System;
using System.Collections.Generic;
using System.Linq;


namespace BI.Mapping
{
    public class AppCustomMapper
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
                Labels = MapLabelsToLabelsDTO(note.LabelsNotes.GetLabelUnDesc()),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
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
                            var tNDTO = new TextNoteDTO(tN.Content, tN.Id, tN.TextType, tN.HeadingType, tN.Checked, tN.UpdatedAt);
                            resultList.Add(tNDTO);
                            break;
                        }
                    case AlbumNote aN:
                        {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.ALBUM);
                            var photosDTO = aN.Photos.Select(item => new AlbumPhotoDTO(item.Id)).ToList();
                            var aNDTO = new AlbumNoteDTO(photosDTO, aN.Width, aN.Height, aN.Id, type, aN.CountInRow, aN.UpdatedAt);
                            resultList.Add(aNDTO);
                            break;
                        }
                    case AudioNote audioNote:
                        {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.AUDIO);
                            var audioNoteDTO = new AudioNoteDTO(audioNote.Name, audioNote.AppFileId, audioNote.Id, type , audioNote.UpdatedAt);
                            resultList.Add(audioNoteDTO);
                            break;
                        }
                    case VideoNote videoNote:
                        {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.VIDEO);
                            var videoNoteDTO = new VideoNoteDTO(videoNote.Name, videoNote.AppFileId, videoNote.Id, type, videoNote.UpdatedAt);
                            resultList.Add(videoNoteDTO);
                            break;
                        }
                    case DocumentNote documentNote:
                        {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.DOCUMENT);
                            var documentNoteDTO = new DocumentNoteDTO(documentNote.Name, documentNote.AppFileId, documentNote.Id, type, documentNote.UpdatedAt);
                            resultList.Add(documentNoteDTO);
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

        public FolderTypeDTO MapTypeToTypeDTO(FolderType type)
        {
            return new FolderTypeDTO(type.Id, type.Name);
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

        public List<LabelDTO> MapLabelsToLabelsDTO(List<Label> labels)
        {
            return labels.Select(x => MapLabelToLabelDTO(x)).ToList();
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
                IsDeleted = lb.IsDeleted,
                DeletedAt = lb.DeletedAt,
                CreatedAt = lb.CreatedAt,
                UpdatedAt = lb.UpdatedAt
            };
        }

        public LabelDTO MapLabelToLabelDTO(Label label)
        {
            return new LabelDTO()
            {
                Id = label.Id,
                Name = label.Name,
                Color = label.Color,
                CountNotes = label.LabelsNotes.Count,
                IsDeleted = label.IsDeleted,
                DeletedAt = label.DeletedAt,
                CreatedAt = label.CreatedAt,
                UpdatedAt = label.UpdatedAt
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
                MapContentsToContentsDTO(tuple.note.Contents).ToList(),
                DeletedAt = tuple.note.DeletedAt,
                CreatedAt = tuple.note.CreatedAt,
                UpdatedAt = tuple.note.UpdatedAt
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
                MapContentsToContentsDTO(note.Contents).ToList(),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
        }

        public PreviewNoteForSelection MapNoteToPreviewNoteDTO(Note note, IEnumerable<Guid> ids , int? takeContentLength = null)
        {
            var result =  new PreviewNoteForSelection()
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
                IsSelected = ids.Contains(note.Id),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
            var dates = result.Contents.Select(x => x.UpdatedAt);
            dates.Append(result.UpdatedAt);
            result.UpdatedAt = dates.Max();
            return result;
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

        public List<SmallFolder> MapFoldersToSmallFolders(IEnumerable<Folder> folders)
        {
            return folders.Select(folder => MapFolderToSmallFolder(folder)).ToList();
        }

        public SmallFolder MapFolderToSmallFolder(Folder folder)
        {
            var notes = folder.FoldersNotes?.Select(x => x.Note);
            return new SmallFolder()
            {
                Id = folder.Id,
                Color = folder.Color,
                CreatedAt = folder.CreatedAt,
                DeletedAt = folder.DeletedAt,
                UpdatedAt = folder.UpdatedAt,
                Title = folder.Title,
                FolderType = MapTypeToTypeDTO(folder.FolderType),
                RefType = MapRefToRefDTO(folder.RefType),
                PreviewNotes = MapNotesToNotesPreviewInFolder(notes)
            };
        }

        public List<NotePreviewInFolder> MapNotesToNotesPreviewInFolder(IEnumerable<Note> notes)
        {
            return notes?.Select(x => MapNoteToNotePreviewInFolder(x)).ToList();
        }

        public NotePreviewInFolder MapNoteToNotePreviewInFolder(Note note)
        {
            return new NotePreviewInFolder()
            { 
                Title = note.Title
            };
        }

        public IEnumerable<FullFolder> MapFoldersToFullFolders(IEnumerable<Folder> folders)
        {
            return folders.Select(folder => MapFolderToFullFolder(folder));
        }

        public FullFolder MapFolderToFullFolder(Folder folder)
        {
            return new FullFolder()
            {
                Id = folder.Id,
                Color = folder.Color,
                CreatedAt = folder.CreatedAt,
                DeletedAt = folder.DeletedAt,
                UpdatedAt = folder.UpdatedAt,
                Title = folder.Title,
                FolderType = MapTypeToTypeDTO(folder.FolderType),
                RefType = MapRefToRefDTO(folder.RefType)
            };
        }

    }
}
