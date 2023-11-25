using Common.Azure;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.App;
using Common.DTO.Folders;
using Common.DTO.Labels;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.DTO.Notes.FullNoteContent.Text;

namespace Mapper.Mapping
{
    public class NoteFolderLabelMapper : BaseMapper
    {
        public NoteFolderLabelMapper(
            AzureConfig azureConfig) : base(azureConfig)
        {
        }

        public AudioNoteDTO MapToAudioDTO(AppFile file, Guid ownerId)
        {
            var metadata = file.GetMetadata();
            return new AudioNoteDTO(file.Name, file.Id, 
                BuildFilePath(file.StorageId, ownerId, file.GetDefaultPath), 
                file.UserId, metadata?.SecondsDuration, metadata?.ImagePath, file.CreatedAt);
        }

        public VideoNoteDTO MapToVideoDTO(AppFile file, Guid ownerId)
        {
            return new VideoNoteDTO(file.Name, file.Id, 
                BuildFilePath(file.StorageId, ownerId, file.GetDefaultPath), 
                file.UserId, file.CreatedAt);
        }

        public DocumentNoteDTO MapToDocumentDTO(AppFile file, Guid ownerId)
        {
            return new DocumentNoteDTO(file.Name, 
                BuildFilePath(file.StorageId, ownerId, file.GetDefaultPath), 
                file.Id, file.UserId, file.CreatedAt);
        }

        public PhotoNoteDTO MapToPhotoDTO(AppFile file, Guid ownerId)
        {
            return new PhotoNoteDTO(file.Id, file.Name, 
                BuildFilePath(file.StorageId, ownerId, file.GetSmallPath), 
                BuildFilePath(file.StorageId, ownerId, file.GetMediumPath), 
                BuildFilePath(file.StorageId, ownerId, file.GetBigPath ?? file.GetDefaultPath), 
                file.UserId, file.CreatedAt);
        }

        // CONTENTS
        public List<BaseNoteContentDTO> MapContentsToContentsDTO(List<BaseNoteContent> contents, Guid ownerId)
        {
            if (contents == null)
            {
                return new List<BaseNoteContentDTO>();
            }

            var resultList = new List<BaseNoteContentDTO>();

            foreach (var content in contents)
            {
                switch (content)
                {
                    case TextNote tN:
                        {
                            resultList.Add(ToTextDTO(tN));
                            break;
                        }
                    case CollectionNote aN:
                        {
                            switch (aN.FileTypeId)
                            {
                                case FileTypeEnum.Audio:
                                    {
                                        resultList.Add(ToAudiosCollection(aN, ownerId));
                                        break;
                                    }
                                case FileTypeEnum.Photo:
                                    {
                                        resultList.Add(ToPhotosCollection(aN, ownerId));
                                        break;
                                    }
                                case FileTypeEnum.Video:
                                    {
                                        resultList.Add(ToVideosCollection(aN, ownerId));
                                        break;
                                    }
                                case FileTypeEnum.Document:
                                    {
                                        resultList.Add(ToDocumentsCollection(aN, ownerId));
                                        break;
                                    }
                            }
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

        public TextNoteDto ToTextDTO(TextNote tN)
        {
            return new TextNoteDto(tN.GetContents(), tN.Id, tN.Order, tN.GetMetadata(), tN.UpdatedAt, tN.Version, tN.PlainContent);
        }

        public AudiosCollectionNoteDTO ToAudiosCollection(CollectionNote aN, Guid ownerId)
        {
            var audiosDTO = aN.Files != null ? aN.Files.Select(item => MapToAudioDTO(item, ownerId)).ToList() : null;
            return new AudiosCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, audiosDTO, aN.Version);
        }

        public PhotosCollectionNoteDTO ToPhotosCollection(CollectionNote aN, Guid ownerId)
        {
            var photosDTO = aN.Files != null ? aN.Files.Select(item => MapToPhotoDTO(item, ownerId)).ToList() : null;
            var metadata = aN.GetMetadata();
            return new PhotosCollectionNoteDTO(photosDTO, aN.Name, metadata?.Width, metadata?.Height, aN.Id, aN.Order, metadata?.CountInRow, aN.UpdatedAt, aN.Version);
        }

        public VideosCollectionNoteDTO ToVideosCollection(CollectionNote aN, Guid ownerId)
        {
            var videosDTO = aN.Files != null ? aN.Files.Select(item => MapToVideoDTO(item, ownerId)).ToList() : null;
            return new VideosCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, videosDTO, aN.Version);
        }

        public DocumentsCollectionNoteDTO ToDocumentsCollection(CollectionNote aN, Guid ownerId)
        {
            var documentsDTO = aN.Files != null ? aN.Files.Select(item => MapToDocumentDTO(item, ownerId)).ToList() : null;
            return new DocumentsCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, documentsDTO, aN.Version);
        }

        public BaseNoteContentDTO ToCollectionNoteDTO(CollectionNote aN)
        {
            var fileType = aN.FileTypeId switch
            {
                FileTypeEnum.Photo => ContentTypeEnumDTO.Photos,
                FileTypeEnum.Document => ContentTypeEnumDTO.Documents,
                FileTypeEnum.Audio => ContentTypeEnumDTO.Audios,
                FileTypeEnum.Video => ContentTypeEnumDTO.Videos,
                _ => throw new Exception("Incorrect type")
            };

            return new BaseNoteContentDTO(aN.Id, aN.Order, fileType, aN.UpdatedAt, aN.Version);
        }

        // TYPES
        public NoteTypeDTO MapTypeToTypeDTO(NoteType type)
        {
            return new NoteTypeDTO(type.Id, type.Name);
        }

        public FolderTypeDTO MapTypeToTypeDTO(FolderType type)
        {
            return new FolderTypeDTO(type.Id, type.Name);
        }



        // LABELS
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
                UpdatedAt = lb.UpdatedAt,
                Order = lb.Order
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
                UpdatedAt = label.UpdatedAt,
                Order = label.Order
            };
        }


        public RelatedNote MapNoteToRelatedNoteDTO(RelatedNoteToInnerNote relation, Guid callerId)
        {
            var state = relation.RelatedNoteUserStates.FirstOrDefault(x => x.UserId == callerId);
            return new RelatedNote()
            {
                ReletionId = relation.Id,
                Id = relation.RelatedNote.Id,
                Color = relation.RelatedNote.Color,
                Title = relation.RelatedNote.Title,
                Order = relation.Order,
                UserId = relation.RelatedNote.UserId,
                IsOpened = state != null ? state.IsOpened : true,
                Labels = relation.RelatedNote.LabelsNotes != null ? MapLabelsToLabelsDTO(relation.RelatedNote.LabelsNotes?.GetLabelUnDesc()) : null,
                NoteTypeId = relation.RelatedNote.NoteTypeId,
                RefTypeId = relation.RelatedNote.RefTypeId,
                Contents = MapContentsToContentsDTO(relation.RelatedNote.Contents, relation.RelatedNote.UserId).ToList(),
                DeletedAt = relation.RelatedNote.DeletedAt,
                CreatedAt = relation.RelatedNote.CreatedAt,
                UpdatedAt = relation.RelatedNote.UpdatedAt,
            };
        }


        public SmallNote MapNoteToSmallNoteDTO(Note note, bool isCanEdit, int order)
        {
            return new SmallNote()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Order = order,
                UserId = note.UserId,
                Labels = note.LabelsNotes != null ? MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                NoteTypeId = note.NoteTypeId,
                RefTypeId = note.RefTypeId,
                Contents = MapContentsToContentsDTO(note.Contents, note.UserId).ToList(),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                IsCanEdit = isCanEdit,
                Version = note.Version,
            };
        }

        public PreviewNoteForSelection MapNoteToPreviewNoteDTO(Note note, IEnumerable<Guid> ids)
        {
            var result = new PreviewNoteForSelection()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Order = note.Order,
                UserId = note.UserId,
                Labels = note.LabelsNotes != null ? MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                NoteTypeId = note.NoteTypeId,
                RefTypeId = note.RefTypeId,
                Contents = MapContentsToContentsDTO(note.Contents, note.UserId).ToList(),
                IsSelected = ids.Contains(note.Id),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                Version = note.Version,
            };
            return result;
        }

        public T SetContent<T>(T note) where T : SmallNote
        {
            note.Contents = note.Contents;
            return note;
        }

        public bool IsCanEdit(Note note, Guid callerId)
        {
            if (note.IsShared() && note.RefTypeId == RefTypeENUM.Editor)
            {
                return true;
            }
            if (note.UserId == callerId)
            {
                return true;
            }
            if (note.UsersOnPrivateNotes != null && note.UsersOnPrivateNotes.Any())
            {
                return note.UsersOnPrivateNotes.Any(x => x.UserId == callerId && x.AccessTypeId == RefTypeENUM.Editor);
            }
            return false;
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

        // FOLDERS

        private bool IsCanEdit(Folder folder, Guid callerId)
        {
            if (folder.IsShared() && folder.RefTypeId == RefTypeENUM.Editor)
            {
                return true;
            }
            if (folder.UserId == callerId)
            {
                return true;
            }

            if (folder.UsersOnPrivateFolders != null && folder.UsersOnPrivateFolders.Any())
            {
                return folder.UsersOnPrivateFolders.Any(x => x.UserId == callerId && x.AccessTypeId == RefTypeENUM.Editor);
            }

            return false;
        }

        public List<SmallFolder> MapFoldersToSmallFolders(IEnumerable<Folder> folders, Guid callerId)
        {
            return folders.Select(folder => MapFolderToSmallFolder(folder, IsCanEdit(folder, callerId))).ToList();
        }

        public SmallFolder MapFolderToSmallFolder(Folder folder, bool isCanEdit)
        {
            var notes = folder.FoldersNotes?.Select(x => x.Note);
            return new SmallFolder()
            {
                Id = folder.Id,
                Color = folder.Color,
                Order = folder.Order,
                UserId = folder.UserId,
                CreatedAt = folder.CreatedAt,
                DeletedAt = folder.DeletedAt,
                UpdatedAt = folder.UpdatedAt,
                Title = folder.Title,
                FolderTypeId = folder.FolderTypeId,
                RefTypeId = folder.RefTypeId,
                IsCanEdit = isCanEdit,
                PreviewNotes = MapNotesToNotesPreviewInFolder(notes),
                Version = folder.Version,
            };
        }

        public FullFolder MapFolderToFullFolder(Folder folder, bool isCanEdit)
        {
            return new FullFolder()
            {
                Id = folder.Id,
                Color = folder.Color,
                UserId = folder.UserId,
                IsCanEdit = isCanEdit,
                CreatedAt = folder.CreatedAt,
                DeletedAt = folder.DeletedAt,
                UpdatedAt = folder.UpdatedAt,
                Title = folder.Title,
                FolderTypeId = folder.FolderTypeId,
                RefTypeId = folder.RefTypeId,
                Version = folder.Version,
            };
        }
    }

}
