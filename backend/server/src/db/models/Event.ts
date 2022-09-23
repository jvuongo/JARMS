import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  ticketPrice: {
    type: Number,
    required: true
  },
  isPrivate: {
    type: Boolean, 
    required: true
  },
  maxGuests: {
    type: Number,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: String,
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  time: String,
  image: String,
  tags: [{type: String}],
  tickets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'}],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Review'
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  avgRating: {
    type: Number
  },
  comments: {
    type: [],
  },
})

/*
    Event Model
*/
const EventModel = mongoose.model("Event", eventSchema)
export default EventModel;
