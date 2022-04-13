using System;
using System.Collections.Generic;
using System.Linq;
using BI.Services.Encryption;
using BI.Services.Notes;
using Common.Azure;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DTO.App;
using Common.DTO.Folders;
using Common.DTO.History;
using Common.DTO.Labels;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Personalization;
using Common.DTO.Users;


namespace BI.Mapping
{
    public class NoteFolderLabelMapper : BaseMapper
    {
        private readonly UserNoteEncryptService userNoteEncryptStorage;

        public NoteFolderLabelMapper(AzureConfig azureConfig, UserNoteEncryptService userNoteEncryptStorage) : base(azureConfig)
        {
            this.userNoteEncryptStorage = userNoteEncryptStorage;
        }

        // CONTENTS
        public List<BaseNoteContentDTO> MapContentsToContentsDTO(List<BaseNoteContent> contents, Guid ownerId)
        {
            if(contents == null)
            {
                return new List<BaseNoteContentDTO>();
            }

            var resultList = new List<BaseNoteContentDTO>();
            
            foreach(var content in contents)
            {
                switch (content)
                {
                    case TextNote tN:
                        {
                            var tNDTO = new TextNoteDTO(tN.Contents, tN.Id, tN.Order, tN.NoteTextTypeId, tN.HTypeId, 
                                tN.Checked, tN.ListId, tN.UpdatedAt);
                            resultList.Add(tNDTO);
                            break;
                        }
                    case CollectionNote aN:
                        {
                            switch (aN.FileTypeId)
                            {
                                case FileTypeEnum.Audio:
                                    {
                                        var audiosDTO = aN.Files.Select(item => new AudioNoteDTO(item.Name, item.Id, BuildPhotoPath(ownerId, item.PathNonPhotoContent), item.UserId, item.MetaData?.SecondsDuration, item.MetaData?.ImagePath, item.CreatedAt)).ToList();
                                        var collectionDTO = new AudiosCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, audiosDTO);
                                        resultList.Add(collectionDTO);
                                        break;
                                    }
                                case FileTypeEnum.Photo:
                                    {
                                       var photosDTO = aN.Files.Select(item => new PhotoNoteDTO(
                                                                item.Id, 
                                                                item.Name, 
                                                                BuildPhotoPath(ownerId, item.PathPhotoSmall),
                                                                BuildPhotoPath(ownerId, item.PathPhotoMedium), 
                                                                BuildPhotoPath(ownerId, item.PathPhotoBig), 
                                                                item.UserId, 
                                                                item.CreatedAt)).ToList();
                                        var collectionDTO = new PhotosCollectionNoteDTO(photosDTO, aN.Name, aN.MetaData.Width, aN.MetaData.Height, aN.Id, aN.Order, aN.MetaData.CountInRow, aN.UpdatedAt);
                                        resultList.Add(collectionDTO);
                                        break;
                                    }
                                case FileTypeEnum.Video:
                                    {
                                        var videosDTO = aN.Files.Select(item => new VideoNoteDTO(item.Name, item.Id, BuildPhotoPath(ownerId, item.PathNonPhotoContent), item.UserId, item.CreatedAt)).ToList();
                                        var collectionDTO = new VideosCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, videosDTO);
                                        resultList.Add(collectionDTO);
                                        break;
                                    }
                                case FileTypeEnum.Document:
                                    {
                                        var documentsDTO = aN.Files.Select(item => new DocumentNoteDTO(item.Name, BuildPhotoPath(ownerId, item.PathNonPhotoContent), item.Id, item.UserId, item.CreatedAt)).ToList();
                                        var collectionDTO = new DocumentsCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, documentsDTO);
                                        resultList.Add(collectionDTO);
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

        private List<BaseNoteContentDTO> GetContentsDTOFromContents(Note note, List<BaseNoteContent> contents, Guid ownerId)
        {
            if (IsLocked(note))
            {
                return new List<BaseNoteContentDTO>();
            }
            return MapContentsToContentsDTO(contents, ownerId).ToList();
        }

        private bool IsLocked(Note note) => note.IsLocked && !userNoteEncryptStorage.IsUnlocked(note.Id);

        private DateTimeOffset? GetUnlockedTime(Guid noteId) => userNoteEncryptStorage.GetUnlockedTime(noteId);

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




        // NOTES 
        public RelatedNote MapNoteToRelatedNoteDTO((Note note, bool isOpened) tuple)
        {
            return new RelatedNote()
            {
                Id = tuple.note.Id,
                Color = tuple.note.Color,
                Title = tuple.note.Title,
                Order = tuple.note.Order,
                UserId = tuple.note.UserId,
                IsOpened = tuple.isOpened,
                Labels = tuple.note.LabelsNotes != null ? MapLabelsToLabelsDTO(tuple.note.LabelsNotes?.GetLabelUnDesc()) : null,
                NoteTypeId = tuple.note.NoteTypeId,
                RefTypeId = tuple.note.RefTypeId,
                Contents = GetContentsDTOFromContents(tuple.note, tuple.note.Contents, tuple.note.UserId),
                IsLocked = tuple.note.IsLocked,
                IsLockedNow = IsLocked(tuple.note),
                UnlockedTime = GetUnlockedTime(tuple.note.Id),
                DeletedAt = tuple.note.DeletedAt,
                CreatedAt = tuple.note.CreatedAt,
                UpdatedAt = tuple.note.UpdatedAt
            };
        }


        public SmallNote MapNoteToSmallNoteDTO(Note note, bool isCanEdit)
        {
            return new SmallNote()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Order = note.Order,
                UserId = note.UserId,
                Labels = note.LabelsNotes != null ? MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                NoteTypeId = note.NoteTypeId,
                RefTypeId = note.RefTypeId,
                Contents = GetContentsDTOFromContents(note, note.Contents, note.UserId),
                IsLocked = note.IsLocked,
                IsLockedNow = IsLocked(note),
                UnlockedTime = GetUnlockedTime(note.Id),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                IsCanEdit = isCanEdit
            };
        }

        public FullNote MapNoteToFullNote(Note note)
        {
            var _fullNote = new FullNote()
            {
                Id = note.Id,
                Color = note.Color,
                NoteTypeId = note.NoteTypeId,
                RefTypeId = note.RefTypeId,
                Title = note.Title,
                Labels = note.LabelsNotes != null ? MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                IsLocked = note.IsLocked,
                IsLockedNow = IsLocked(note),
                UnlockedTime = GetUnlockedTime(note.Id),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
            return _fullNote;
        }

        public PreviewNoteForSelection MapNoteToPreviewNoteDTO(Note note, IEnumerable<Guid> ids)
        {
            var result =  new PreviewNoteForSelection()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Order = note.Order,
                UserId = note.UserId,
                Labels = note.LabelsNotes != null ? MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                NoteTypeId = note.NoteTypeId,
                RefTypeId = note.RefTypeId,
                Contents = GetContentsDTOFromContents(note, note.Contents, note.UserId),
                IsSelected = ids.Contains(note.Id),
                IsLocked = note.IsLocked,
                IsLockedNow = IsLocked(note),
                UnlockedTime = GetUnlockedTime(note.Id),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
            var dates = result.Contents.Select(x => x.UpdatedAt);
            dates.Append(result.UpdatedAt);
            result.UpdatedAt = dates.Count() > 0 ? dates.Max() : DateTimeOffset.MinValue; 
            return result;
        }

        public List<PreviewNoteForSelection> MapNotesToPreviewNotesDTO(List<Note> notes, IEnumerable<Guid> ids)
        {
            return notes.Select((note) => MapNoteToPreviewNoteDTO(note, ids)).ToList();
        }

        public List<SmallNote> MapNotesToSmallNotesDTO(IEnumerable<Note> notes, Guid callerId)
        {
            return notes.Select(note => MapNoteToSmallNoteDTO(note, IsCanEdit(note, callerId))).ToList();
        }

        private bool IsCanEdit(Note note, Guid callerId)
        {
            if(note.UserId == callerId)
            {
                return true;
            }

            if(note.UsersOnPrivateNotes != null && note.UsersOnPrivateNotes.Any())
            {
                return note.UsersOnPrivateNotes.Any(x => x.UserId == callerId && x.AccessTypeId == RefTypeENUM.Editor);
            }

            return false;
        }

        private bool IsCanEdit(Folder folder, Guid callerId)
        {
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

        public List<RelatedNote> MapNotesToRelatedNotes(List<ReletatedNoteToInnerNote> notes)
        {
            var resultList = new List<(Note, bool)>();
            notes.ForEach(note => resultList.Add((note.RelatedNote, note.IsOpened)));
            return resultList.Select(tuple => MapNoteToRelatedNoteDTO(tuple)).ToList();
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
                PreviewNotes = MapNotesToNotesPreviewInFolder(notes)
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
                FolderTypeId = folder.FolderTypeId,
                RefTypeId = folder.RefTypeId
            };
        }


        // HISTORY

        public UserNoteHistory MapUserToUserNoteHistory(User user)
        {
            return new UserNoteHistory()
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = user.UserProfilePhoto?.AppFile.GetFromSmallPath ?? user.DefaultPhotoUrl
            };
        }

        public List<UserNoteHistory> MapUsersToUsersNoteHistory(IEnumerable<User> users)
        {
            return users.Select(x => MapUserToUserNoteHistory(x)).ToList();
        }

        public NoteHistoryDTO MapHistoryToHistoryDto(NoteSnapshot historyDTO)
        {
            return new NoteHistoryDTO()
            {
                SnapshotTime = historyDTO.SnapshotTime,
                Users = MapUsersToUsersNoteHistory(historyDTO.Users),
                NoteVersionId = historyDTO.Id
            };
        }

        public List<NoteHistoryDTO> MapHistoriesToHistoriesDto(IEnumerable<NoteSnapshot> histories)
        {
            return histories.Select(x => MapHistoryToHistoryDto(x)).ToList();
        }

        public NoteSnapshotDTO MapNoteSnapshotToNoteSnapshotDTO(NoteSnapshot snapshot)
        {
            return new NoteSnapshotDTO()
            {
                Id = snapshot.Id,
                Color = snapshot.Color,
                SnapshotTime = snapshot.SnapshotTime,
                Labels = snapshot.Labels.Select(x => new LabelDTO { Name = x.Name, Color = x.Color }).ToList(),
                NoteId = snapshot.NoteId,
                NoteTypeId = snapshot.NoteTypeId,
                RefTypeId = snapshot.RefTypeId,
                Title = snapshot.Title
            };
        }

        // PERSONALIZATION
        public PersonalizationSettingDTO MapPersonalizationSettingToPersonalizationSettingDTO(PersonalizationSetting pr)
        {
            return new PersonalizationSettingDTO()
            {
                IsViewAudioOnNote = pr.IsViewAudioOnNote,
                IsViewDocumentOnNote = pr.IsViewDocumentOnNote,
                IsViewPhotosOnNote = pr.IsViewPhotosOnNote,
                IsViewTextOnNote = pr.IsViewTextOnNote,
                IsViewVideoOnNote = pr.IsViewVideoOnNote,
                NotesInFolderCount = pr.NotesInFolderCount,
                ContentInNoteCount = pr.ContentInNoteCount,
                SortedNoteByTypeId = pr.SortedNoteByTypeId,
                SortedFolderByTypeId = pr.SortedFolderByTypeId
            };
        }

    }
}
