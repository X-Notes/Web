using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public NoteFolderLabelMapper(
            AzureConfig azureConfig, 
            UserNoteEncryptService userNoteEncryptStorage) : base(azureConfig)
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
                                        var audiosDTO = aN.Files.Select(item => new AudioNoteDTO(item.Name, item.Id, BuildFilePath(ownerId, item.PathNonPhotoContent), item.UserId, item.MetaData?.SecondsDuration, BuildFilePath(ownerId, item.MetaData?.ImagePath), item.CreatedAt)).ToList();
                                        var collectionDTO = new AudiosCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, audiosDTO);
                                        resultList.Add(collectionDTO);
                                        break;
                                    }
                                case FileTypeEnum.Photo:
                                    {
                                       var photosDTO = aN.Files.Select(item => new PhotoNoteDTO(
                                                                item.Id, 
                                                                item.Name, 
                                                                BuildFilePath(ownerId, item.PathPhotoSmall),
                                                                BuildFilePath(ownerId, item.PathPhotoMedium), 
                                                                BuildFilePath(ownerId, item.PathPhotoBig), 
                                                                item.UserId, 
                                                                item.CreatedAt)).ToList();
                                        var collectionDTO = new PhotosCollectionNoteDTO(photosDTO, aN.Name, aN.MetaData.Width, aN.MetaData.Height, aN.Id, aN.Order, aN.MetaData.CountInRow, aN.UpdatedAt);
                                        resultList.Add(collectionDTO);
                                        break;
                                    }
                                case FileTypeEnum.Video:
                                    {
                                        var videosDTO = aN.Files.Select(item => new VideoNoteDTO(item.Name, item.Id, BuildFilePath(ownerId, item.PathNonPhotoContent), item.UserId, item.CreatedAt)).ToList();
                                        var collectionDTO = new VideosCollectionNoteDTO(aN.Id, aN.Order, aN.UpdatedAt, aN.Name, videosDTO);
                                        resultList.Add(collectionDTO);
                                        break;
                                    }
                                case FileTypeEnum.Document:
                                    {
                                        var documentsDTO = aN.Files.Select(item => new DocumentNoteDTO(item.Name, BuildFilePath(ownerId, item.PathNonPhotoContent), item.Id, item.UserId, item.CreatedAt)).ToList();
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

        public List<RelatedNote> MapNotesToRelatedNotes(List<ReletatedNoteToInnerNote> notes, Guid callerId)
        {
            return notes.Select(note =>
            {
                var m = MapNoteToRelatedNoteDTO(note, callerId);
                m = SetLockedState(m, note.RelatedNote);
                m = SetContent(m);
                return m;
            }).ToList(); ;
        }

        public RelatedNote MapNoteToRelatedNoteDTO(ReletatedNoteToInnerNote relation, Guid callerId)
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
                UpdatedAt = relation.RelatedNote.UpdatedAt
            };
        }

        public List<SmallNote> MapNotesToSmallNotesDTO(IEnumerable<Note> notes, Guid callerId)
        {
            return notes.Select(note =>
            {
                var m = MapNoteToSmallNoteDTO(note, IsCanEdit(note, callerId));
                m = SetLockedState(m, note);
                m = SetContent(m);
                return m;
            }).ToList();
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
                Contents = MapContentsToContentsDTO(note.Contents, note.UserId).ToList(),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                IsCanEdit = isCanEdit
            };
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
                Labels = note.LabelsNotes != null ? MapLabelsToLabelsDTO(note.LabelsNotes?.GetLabelUnDesc()) : null,
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
            _fullNote = SetLockedState(_fullNote, note);
            return _fullNote;
        }

        public List<PreviewNoteForSelection> MapNotesToPreviewNotesDTO(List<Note> notes, IEnumerable<Guid> ids)
        {
            return notes.Select(note =>
            {
                var m = MapNoteToPreviewNoteDTO(note, ids);
                m = SetLockedState(m, note);
                m = SetContent(m);
                return m;
            }).ToList();
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
                Contents = MapContentsToContentsDTO(note.Contents, note.UserId).ToList(),
                IsSelected = ids.Contains(note.Id),
                DeletedAt = note.DeletedAt,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
            return result;
        }

        private T SetLockedState<T>(T note, Note dbNote) where T : LockNoteDTO
        {
            note.IsLocked = dbNote.IsLocked;
            note.IsLockedNow = dbNote.IsLocked ? !userNoteEncryptStorage.IsUnlocked(dbNote.UnlockTime) : false;
            note.UnlockedTime = dbNote.UnlockTime;
            return note;
        }

        private T SetContent<T>(T note) where T : SmallNote
        {
            note.Contents = note.IsLockedNow ? null : note.Contents;
            return note;
        }

        private bool IsCanEdit(Note note, Guid callerId)
        {
            if(note.IsShared() && note.RefTypeId == RefTypeENUM.Editor)
            {
                return true;
            }
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
                PreviewNotes = MapNotesToNotesPreviewInFolder(notes)
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
