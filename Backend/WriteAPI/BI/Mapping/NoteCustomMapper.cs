﻿using BI.services.notes;
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
        public FullNote TranformNoteToFullNote(Note note)
        {
            var _fullNote = new FullNote()
            {
                Id = note.Id,
                Color = note.Color,
                NoteType = TranformTypeToTypeDTO(note.NoteType),
                RefType = TranformRefToRefDTO(note.RefType),
                Title = note.Title,
                Labels = TranformLabelsToLabelsDTO(note.LabelsNotes)
            };
            return _fullNote;
        }

        public List<BaseContentNoteDTO> TranformContentsToContentsDTO(List<BaseNoteContent> Contents)
        {
            var resultList = new List<BaseContentNoteDTO>();

            var content = Contents?.FirstOrDefault(x => x.PrevId == null);
            
            while(content != null)
            {
                switch (content)
                {
                    case TextNote tN:
                        {
                            var tNDTO = new TextNoteDTO(tN.Content, tN.Id, tN.TextType, tN.HeadingType, tN.Checked, tN.NextId, tN.PrevId);
                            resultList.Add(tNDTO);
                            break;
                        }
                    case AlbumNote aN:
                        {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.ALBUM);
                            var photosDTO = aN.Photos.Select(item => new AlbumPhotoDTO(item.Id)).ToList();
                            var aNDTO = new AlbumNoteDTO(photosDTO, aN.Width, aN.Height, aN.Id, type, aN.NextId, aN.PrevId, aN.CountInRow);
                            resultList.Add(aNDTO);
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
                content = content.Next;
            }

            if(resultList.Count != Contents.Count)
            {
                Console.WriteLine("Some Data is lost");
            }
            return resultList;
        }

        public NoteTypeDTO TranformTypeToTypeDTO(NoteType type)
        {
            return new NoteTypeDTO(type.Id, type.Name);
        }

        public RefTypeDTO TranformRefToRefDTO(RefType type)
        {
            return new RefTypeDTO(type.Id, type.Name);
        }

        public List<LabelDTO> TranformLabelsToLabelsDTO(List<LabelsNotes> labelsNotes)
        {
            var count = labelsNotes.Count();
            return labelsNotes.Select(x => TranformLabelToLabelDTO(x, count)).ToList();
        }

        public LabelDTO TranformLabelToLabelDTO(LabelsNotes label, int count)
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

        public SmallNote TranformNoteToSmallNoteDTO(Note note, int? takeContentLength = null)
        {
            return new SmallNote()
            {
                Id = note.Id,
                Color = note.Color,
                Title = note.Title,
                Labels = TranformLabelsToLabelsDTO(note.LabelsNotes),
                NoteType = note.NoteType != null ? TranformTypeToTypeDTO(note.NoteType) : null,
                RefType = note.RefType != null ? TranformRefToRefDTO(note.RefType) : null,
                Contents = takeContentLength.HasValue ? 
                TranformContentsToContentsDTO(note.Contents).Take(takeContentLength.Value).ToList() :
                TranformContentsToContentsDTO(note.Contents).ToList()
            };
        }


        public List<SmallNote> TranformNotesToSmallNotesDTO(List<Note> notes, int? takeContentLength = null)
        {
            return notes.Select(note => TranformNoteToSmallNoteDTO(note, takeContentLength)).ToList();
        }

        public List<SmallNote> TranformRelatedNotesToSmallNotes(List<ReletatedNoteToInnerNote> notes, int? takeContentLength = null)
        {
            var resultList = new List<Note>();

            var note = notes.FirstOrDefault(x => x.PrevId == null);

            while (note != null)
            {
                note.RelatedNote.LabelsNotes = note.RelatedNote.LabelsNotes.GetLabelUnDesc();
                resultList.Add(note.RelatedNote);
                note = notes.FirstOrDefault(x => x.Id == note.NextId);
            }

            if (resultList.Count != notes.Count)
            {
                Console.WriteLine("Some Data is lost");
            }

            return resultList.Select(note => TranformNoteToSmallNoteDTO(note, takeContentLength)).ToList();
        }
    }
}
