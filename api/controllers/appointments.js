const Model = require("../models/index.js");
const {Appointment, Slot} = Model;

const appointmentController = {
    all(req, res) {
        // Returns all appointments
        Appointment.find({}).exec((err, appointments) =>
            res.json(appointments)
        );
    },
    async create(req, res) {
        console.log("Request Received", req);
        var requestBody = req.body;

        var newslot = new Slot({
            slot_time: requestBody.slot_time,
            slot_date: requestBody.slot_date,
            created_at: Date.now(),
        });

        newslot.save();
        // Creates a new record from a submitted form
        var newappointment = new Appointment({
            name: requestBody.name,
            email: requestBody.email,
            phone: requestBody.phone,
            slots: newslot._id,
        });

        console.log("New Appointment Created", newappointment);

        // and saves the record to
        // the data base
        await newappointment.save((err, saved) => {
            // Returns the saved appointment
            // after a successful save
            Appointment.find({_id: saved._id})
                .populate("slots")
                .exec((err, appointment) => res.json(appointment));
        });
    },
};

module.exports = appointmentController;
