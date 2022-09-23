/*
    Script to create Jarms database in Mongodb and populate it with mock data.
*/
const mongoose = require("mongoose")
const config = require("config")

import UserModel from "./models/User"
import EventModel from "./models/Event"
import TicketModel from "./models/Ticket"
import { createWatchCompilerHost } from "typescript"
import ReviewModel from "./models/Review"
// Fix below to update to TS

const dbUri = config.get('dbUri')
const conn = mongoose.connect(dbUri)

run()
async function run(){

    /*
        Creates and populate a collection of Users.
        WARNING MOCK DATA NOT UP TO DATE WITH LATEST SCHEMA!
    */

    // unused avatar "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650244110/ebse73okdkhlrfrmxusn.jpg"

    const user1 = await UserModel.create({
        firstName:"Ricky", 
        lastName: "Gian",
        age: 21,
        email: "rg@mail.com",
        password: "gian123123",
        confirmPassword: "gian123123",
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650244110/ebse73okdkhlrfrmxusn.jpg",
        bio: "Cooking like a chef"
    })
    const user2 = await UserModel.create({
        firstName:"Steven", 
        lastName: "Lam",
        age: 21,
        email: "sl@mail.com",
        password: "lam123123",
        confirmPassword: "lam123123",
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650244042/ftbs2dyilrnvfqy8u7gp.jpg",
        bio: "Doing frontend stuff zzzz big bucks though."
    })
    const user3 = await UserModel.create({
        firstName:"Jack", 
        lastName: "Vuong",
        age: 20,
        email: "jv@mail.com",
        password: "vuong123123",
        confirmPassword: "vuong123123",
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650244098/sygz7xd8n6kvhngckt84.jpg",
        bio: "If you want to hire a scrum master dm me."
    })
    const user4 = await UserModel.create({
        firstName:"Andrew", 
        lastName: "Chung",
        age: 21,
        email: "ac@mail.com",
        password: "chung123123",
        confirmPassword: "chung123123",
        friends: [user1._id, user2._id],
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650243999/cjdizlmm4qplbcglibon.jpg",
        bio: "About to graduate! Dm me for tips and tricks."
    })
    const user5 = await UserModel.create({
        firstName:"Matthew", 
        lastName: "Kokolich",
        age: 21,
        email: "mk@mail.com",
        password: "kokolich",
        confirmPassword: "kokolich",
        friends: [user1._id],
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650244053/jgcnmltauz8kepsneh7v.jpg",
        bio: "What that dog doing?",
        interestedEventTypes:["Party"]
    })
    const user6 = await UserModel.create({
        firstName:"Joe", 
        lastName: "Mama",
        age: 21,
        email: "joemeetic@outlook.com",
        password: "Joemama2",
        confirmPassword: "Joemama2",
        friends: [user1._id, user2._id, user3._id, user4._id, user5._id],
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1649126286/nyabr2o0ti1gvrl7piap.jpg",
        bio: "Honestly mum jokes are overrated.",
        interestedEventTypes:["Party"],
        eventTypeHistory:["Social Gathering"]
    })
    const user7 = await UserModel.create({
        firstName:"Bob", 
        lastName: "McBobby",
        age: 27,
        email: "bobbymeetic@outlook.com",
        password: "Asdasd12",
        confirmPassword: "Asdasd12",
        friends: [user5._id],
        avatar: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1647041561/oaatbhgs2bkxbkmaoybl.webp",
        bio: "I watch Bob the builder religiously.",
        interestedEventTypes:["Party"]
    })
    
    // Recombee integration.
    var recombee = require('recombee-api-client');
    var rqs = recombee.requests;
    var client = new recombee.ApiClient('jarms-dev', 'JZU68AyaIhdPkIVrsKyt4r6XuW24rzxdc15cVfJ1zjt6PcoQxIu6ckCMqtJscNE3');

        // Set property values of the given user.
        await client.send(new rqs.SetUserValues(user5._id, {
            "interestedEventTypes": user5.interestedEventTypes,
        }, {
            'cascadeCreate': true
        }));

        // Set property values of the given user.
        await client.send(new rqs.SetUserValues(user6._id, {
            "interestedEventTypes": user6.interestedEventTypes,
            "type": user6.eventTypeHistory,
        }, {
            'cascadeCreate': true
        }));
        
        // Set property values of the given user.
        await client.send(new rqs.SetUserValues(user7._id, {
            "interestedEventTypes": user7.interestedEventTypes,
        }, {
            'cascadeCreate': true
        }));   

    // Friends 

    console.log(user1)
    console.log(user2)
    console.log(user3)
    console.log(user4)
    console.log(user5)
    console.log(user6)
    console.log(user7)

    /*
        Creates new events
    */
   const event1 = await EventModel.create({
        _id : new mongoose.Types.ObjectId(),
        host: user6._id,
        isPrivate: false,
        description: "Watchin' the footie",
        ticketPrice: 100,
        maxGuests: 10,
        title: "AFL",
        location: "ANZ stadium",
        startDate: "2022-09-01", //1st Sept 2022
        endDate: "2022-09-01",
        image: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1647259349/original_i4zg8e.jpg",
        attendees: [],
        tags: ["Social Gathering"]
   })

   const event2 = await EventModel.create({
        _id : new mongoose.Types.ObjectId(),
        host: user2._id,
        isPrivate: false,
        description: "Far East Movement is an American hip hop group, formed of high school companions Kev Nish, Progress, J-Splif, and late arrival DJ Virman, formed in 2003 in Los Angeles, California, U.S. ",
        ticketPrice: 20,
        maxGuests: 1000,
        title: "Far East Movement - world tour",
        location: "Allianz Stadium",
        startDate: "2022-11-13", //13th Dec 2022
        endDate: "2022-11-13",
        image: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650265806/fareast_jq2zbi.jpg",
        attendees: [user5._id, user6._id, user7._id],
        tags: ["Concert"]
})

// populate event3 with some comments
let stubCommentsData = [
    {
      _id: 13,
      points: 20,
      createdAt: "2018-03-28T20:15:00.111Z",
      text: "Hi Catherine, looking\n forward\n to\n it. Is there anything else we should bring?",
      user: user3._id,
      comments: [
        {
            _id: 27,
            points: 30,
            createdAt: "2018-03-28T20:16:00.112Z",
            text: "I've got some speakers I can bring 😎",
            user: user2._id,
            comments: [
            {
                _id: 32,
                points: 12,
                createdAt: "2018-03-28T20:17:00.113Z",
                text: "I'll bring my fire mixtapes then :)",
                user: user5._id,
                comments: [
                // replies here
                ]
            }
            ]
        },
        {
          _id: 42,
          points: 13,
          createdAt: "2018-03-28T20:17:00.114Z",
          text: "I'll be bringing a couple snacks and chocolate for the sweet tooths among us (sus)",
          user: user4._id,
          comments: [
            // replies here
          ]
        }
      ]
    },
    {
      _id: 51,
      points: 4,
      createdAt: "2018-03-28T20:12:00.115Z",
      text: "Sounds good. Looking forward to next weekend!",
      user: user1._id,
      comments: [
        // replies here
      ]
    },
    {
        _id: 69,
        points: 68,
        createdAt: "2022-03-24T20:12:00.116Z",
        text: "I got a couple spare bottles of soju. Anyone else bringing any drinks?",
        user: user4._id,
        comments: [
            {
                _id: 70,
                points: 0,
                createdAt: "2022-03-25T20:17:00.117Z",
                text: "And I'll bring an extra esky in case we need it",
                user: user3._id,
                comments: [
                  // replies here
                ]
            },
            {
                _id: 86,
                points: 1,
                createdAt: "2024-03-25T20:17:00.118Z",
                text: "Yeah I've got some stuff to bring, might stop by Murphy's on the way over.",
                user: user5._id,
                comments: [
                  // replies here
                ]
            }
        ]
    }
  ];

const event3 = await EventModel.create({
        _id : new mongoose.Types.ObjectId(),
        host: user1._id,
        isPrivate: false,
        description: "Shrek The Musical is a musical with music by Jeanine Tesori and book and lyrics by David Lindsay-Abaire. It is based on the 2001 DreamWorks Animation film Shrek, along with elements of its sequels: Shrek 2, Shrek Forever After and William Steig's 1990 book Shrek!. ",
        ticketPrice: 0,
        maxGuests: 210,
        title: "Shrek the Musical",
        location: "Enmore Theatre",
        startDate: "2022-12-01", //1st Dec 2022
        endDate: "2023-12-01",
        image: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1647259145/shrek_gmn2iw.jpg",
        attendees: [user7._id],
        tags: ["Social Gathering"]
})

const event4 = await EventModel.create({
    _id : new mongoose.Types.ObjectId(),
    host: user7._id,
    isPrivate: false,
    description: "New too UNSW? Want to meet some people and make some friends? Well come join the annual Fig tree sleepover where you will be seperated into groups of 6, allocated dorms rooms and journey around campus doing activities!",
    ticketPrice: 100,
    maxGuests: 60,
    title: "Fig Tree Hall sleepover",
    location: "2052, Australia Ln, Kensington NSW 2025",
    startDate: "2022-04-22", //22nd Apr 2022
    endDate: "2022-04-22",
    image: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650266060/fig_tree_sbgwed.jpg",
    attendees: [user1._id, user2._id, user3._id, user4._id, user5._id, user6._id, user7._id],
    comments: stubCommentsData,
    tags: ["Party"]
})

const event5 = await EventModel.create({
    _id : new mongoose.Types.ObjectId(),
    host: user3._id,
    isPrivate: false,
    description: "Come with in a group or by yourself, Sydneys BVL will cater to all individuals whom show interest in the holy sport of volleyball.",
    ticketPrice: 0,
    maxGuests: 100,
    title: "Bondi Beach Volleyball",
    location: "Bondi beach",
    startDate: "2022-04-22", //22nd Apr 2022
    endDate: "2022-04-22",
    image: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650266252/vl_o3yw0b.jpg",
    attendees: [user2._id, user3._id, user4._id],
    tags: ["Social Gathering"]
})

const pastEvent = await EventModel.create({
    _id : new mongoose.Types.ObjectId(),
    host: user7._id,
    isPrivate: false,
    description: "We just want to meet new people and get more experience with cooking for new guests. Please message either of us any allergies you may have a week prior to the event. No children under the age of 16.",
    ticketPrice: 20,
    maxGuests: 7,
    title: "Home cook meal course",
    location: "67 Duplex street",
    startDate: "2022-04-02", //2nd Apr 2022
    endDate: "2022-04-02",
    image: "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1650266632/thanksgiving_dinner_ly669e.jpg",
    attendees: [],
    tags: ["Social Gathering"]
})

    // Recombee integration.
    // Set property values of a given item of given eventid to facilitate recommendations.
    await client.send(new rqs.SetItemValues(event3._id, {
        "type": event3.tags,
    }, {
        'cascadeCreate': true
    }));

    // Set property values of a given item of given eventid to facilitate recommendations.
    await client.send(new rqs.SetItemValues(event5._id, {
        "type": event5.tags,
    }, {
        'cascadeCreate': true
    }));

   console.log(event1)
   console.log(event2)
   console.log(event3)
   console.log(event4)
   /*
    Create new tickets
   */

    
    const ticket1 = await TicketModel.create({
        event: event1._id,
        uid: user1._id,
        email: user1.email,
        eventName: event1.title,
        eventHost: event1.host.firstName + ' ' + event1.host.lastName,
        eventDate: event1.endDate,
    })

    const ticket2 = await TicketModel.create({
        event: event2._id,
        uid: user2._id,
        email: user2.email,
        eventName: event2.title,
        eventHost: user2.firstName + ' ' + user2.lastName,
        eventDate: event2.endDate,
    })

    const ticket3 = await TicketModel.create({
        event: event2._id,
        uid: user1._id,
        email: user1.email,
        eventName: event2.title,
        eventHost: user2.firstName + ' ' + user2.lastName,
        eventDate: event2.endDate,
    })

    const ticket4 = await TicketModel.create({
        event: event4._id,
        uid: user1._id,
        email: user1.email,
        eventName: event4.title,
        eventHost: user7.firstName + ' ' + user7.lastName,
        eventDate: event4.endDate,
    })

    const ticket5 = await TicketModel.create({
        event: event4._id,
        uid: user2._id,
        email: user2.email,
        eventName: event4.title,
        eventHost: user7.firstName + ' ' + user7.lastName,
        eventDate: event4.endDate,
    })

    const ticket6 = await TicketModel.create({
        eid: event3._id,
        uid: user7._id,
        email: user7.email,
        eventName: event3.title,
        eventHost: user1.firstName + ' ' + user1.lastName,
        eventDate: "2023-12-01",
    })

    const ticket7 = await TicketModel.create({
        eid: pastEvent._id,
        uid: user6._id,
        email: user6.email,
        eventName: pastEvent.title,
        eventHost: user7.firstName + ' ' + user7.lastName,
        eventDate: "2022-04-02", //2nd Apr 2022
    })

    /*
        Attach tickets
    */
    // Add ticket6 id to user7 through UserModel
    await UserModel.findByIdAndUpdate(user1._id, {$push: {tickets: ticket4._id}});
    await UserModel.findByIdAndUpdate(user2._id, {$push: {tickets: ticket2._id}});
    await UserModel.findByIdAndUpdate(user1._id, {$push: {tickets: ticket3._id}});

    await UserModel.findByIdAndUpdate(user7._id, {$push: {tickets: ticket6._id}});
    await UserModel.findByIdAndUpdate(user6._id, {$push: {tickets: ticket7._id}});


    // Pushing into hosted event array
    await UserModel.findByIdAndUpdate(user6._id, {$push : {hostedEvents: event1._id}})
    await UserModel.findByIdAndUpdate(user2._id, {$push : {hostedEvents: event2._id}})
    await UserModel.findByIdAndUpdate(user1._id, {$push : {hostedEvents: event3._id}})
    await UserModel.findByIdAndUpdate(user7._id, {$push : {hostedEvents: event4._id}})
    await UserModel.findByIdAndUpdate(user3._id, {$push : {hostedEvents: event5._id}})
    await UserModel.findByIdAndUpdate(user7._id, {$push : {hostedEvents: pastEvent._id}})

    const review1 = await ReviewModel.create({
        eid: event1._id,
        reviewer: user7._id,
        review: "This event was absolutely phenomenal",
        rating: 5
    })
    await EventModel.findByIdAndUpdate(event1._id, {$push: {reviews: review1._id}});

    const review2 = await ReviewModel.create({
        eid: event1._id,
        reviewer: user2._id,
        review: "It was ok, I geuss",
        rating: 3
    })
    await EventModel.findByIdAndUpdate(event1._id, {$push: {reviews: review2._id}})


    //console.log(user2)
    process.exit(1)
}

