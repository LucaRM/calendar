import axios from "axios";
import AppBar from "material-ui/AppBar";
import Card from "material-ui/Card";
import DatePicker from "material-ui/DatePicker";
import Dialog from "material-ui/Dialog";
import DropDownMenu from "material-ui/DropDownMenu";
import FlatButton from "material-ui/FlatButton";
import MenuItem from "material-ui/MenuItem";
import {RadioButton, RadioButtonGroup} from "material-ui/RadioButton";
import RaisedButton from "material-ui/RaisedButton";
import SelectField from "material-ui/SelectField";
import SnackBar from "material-ui/Snackbar";
import {Step, StepContent, StepLabel, Stepper} from "material-ui/Stepper";
import TextField from "material-ui/TextField";
import moment from "moment";
import React, {Component} from "react";

const API_BASE = "http://localhost:8083/";

class AppointmentApp extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            professional: "",
            professionalID: 0,
            firstName: "",
            lastName: "",
            email: "",
            schedule: [],
            confirmationModalOpen: false,
            appointmentDateSelected: false,
            appointmentMeridiem: 0,
            validEmail: true,
            validPhone: true,
            finished: false,
            smallScreen: window.innerWidth < 768,
            stepIndex: 0,
        };
    }
    componentWillMount() {
        axios.get(API_BASE + `api/retrieveSlots`).then((response) => {
            console.log("response via db: ", response.data);
            this.handleDBReponse(response.data);
        });
    }
    handleSetAppointmentDate(date) {
        this.setState({appointmentDate: date, confirmationTextVisible: true});
    }
    handleSetProfessional(professional) {
        this.setState({professional: professional});
    }

    handleSetAppointmentSlot(slot) {
        this.setState({appointmentSlot: slot});
    }
    handleSetAppointmentMeridiem(meridiem) {
        this.setState({appointmentMeridiem: meridiem});
    }
    handleSubmit() {
        this.setState({confirmationModalOpen: false});
        const newAppointment = {
            name: this.state.firstName + " " + this.state.lastName,
            email: this.state.email,
            phone: this.state.phone,
            professional: this.state.professional,
            professionalID: this.state.professionalID,
            slot_date: moment(this.state.appointmentDate).format("YYYY-DD-MM"),
            slot_time: this.state.appointmentSlot,
        };
        axios
            .post(API_BASE + "api/appointmentCreate", newAppointment)
            .then((response) =>
                this.setState({
                    confirmationSnackbarMessage:
                        "Appointment succesfully added!",
                    confirmationSnackbarOpen: true,
                    processed: true,
                })
            )
            .catch((err) => {
                console.log(err);
                return this.setState({
                    confirmationSnackbarMessage: "Appointment failed to save.",
                    confirmationSnackbarOpen: true,
                });
            });
    }
    handleProfessionalChange = (event, index, value) => {
        this.setState({professional: value});
    };

    handleNext = () => {
        const {stepIndex} = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 3,
        });
    };

    handlePrev = () => {
        const {stepIndex} = this.state;
        if (stepIndex > 0) {
            this.setState({stepIndex: stepIndex - 1});
        }
    };
    validateEmail(email) {
        const regex =
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return regex.test(email)
            ? this.setState({email: email, validEmail: true})
            : this.setState({validEmail: false});
    }
    validatePhone(phoneNumber) {
        const regex =
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return regex.test(phoneNumber)
            ? this.setState({phone: phoneNumber, validPhone: true})
            : this.setState({validPhone: false});
    }
    checkDisableDate(day) {
        const dateString = moment(day).format("YYYY-DD-MM");
        return (
            this.state.schedule[dateString] === true ||
            moment(day).startOf("day").diff(moment().startOf("day")) < 0
        );
    }

    handleDBReponse(response) {
        const appointments = response;
        const today = moment().startOf("day"); //start of today 12 am
        const initialSchedule = {};
        initialSchedule[today.format("YYYY-DD-MM")] = true;
        const schedule = !appointments.length
            ? initialSchedule
            : appointments.reduce((currentSchedule, appointment) => {
                  const {slot_date, slot_time} = appointment;
                  const dateString = moment(slot_date, "YYYY-DD-MM").format(
                      "YYYY-DD-MM"
                  );
                  !currentSchedule[slot_date]
                      ? (currentSchedule[dateString] = Array(8).fill(false))
                      : null;
                  Array.isArray(currentSchedule[dateString])
                      ? (currentSchedule[dateString][slot_time] = true)
                      : null;
                  return currentSchedule;
              }, initialSchedule);

        for (let day in schedule) {
            let slots = schedule[day];
            slots.length
                ? slots.every((slot) => slot === true)
                    ? (schedule[day] = true)
                    : null
                : null;
        }

        this.setState({
            schedule: schedule,
        });
    }
    renderAppointmentConfirmation() {
        const spanStyle = {color: "#00C853"};
        return (
            <section>
                <p>
                    Name:{" "}
                    <span style={spanStyle}>
                        {this.state.firstName} {this.state.lastName}
                    </span>
                </p>
                <p>
                    Number: <span style={spanStyle}>{this.state.phone}</span>
                </p>
                <p>
                    Email: <span style={spanStyle}>{this.state.email}</span>
                </p>
                <p>
                    Appointment:{" "}
                    <span style={spanStyle}>
                        {moment(this.state.appointmentDate).format(
                            "dddd[,] MMMM Do[,] YYYY"
                        )}
                    </span>{" "}
                    at{" "}
                    <span style={spanStyle}>
                        {moment()
                            .hour(9)
                            .minute(0)
                            .add(this.state.appointmentSlot, "hours")
                            .format("h:mm a")}
                    </span>
                </p>
            </section>
        );
    }
    renderAppointmentTimes() {
        if (!this.state.isLoading) {
            const slots = [...Array(8).keys()];
            return slots.map((slot) => {
                const appointmentDateString = moment(
                    this.state.appointmentDate
                ).format("YYYY-DD-MM");
                const time1 = moment().hour(9).minute(0).add(slot, "hours");
                const time2 = moment()
                    .hour(9)
                    .minute(0)
                    .add(slot + 1, "hours");
                const scheduleDisabled = this.state.schedule[
                    appointmentDateString
                ]
                    ? this.state.schedule[
                          moment(this.state.appointmentDate).format(
                              "YYYY-DD-MM"
                          )
                      ][slot]
                    : false;
                const meridiemDisabled = this.state.appointmentMeridiem
                    ? time1.format("a") === "am"
                    : time1.format("a") === "pm";
                return (
                    <RadioButton
                        label={
                            time1.format("h:mm a") +
                            " - " +
                            time2.format("h:mm a")
                        }
                        key={slot}
                        value={slot}
                        style={{
                            marginBottom: 15,
                            display: meridiemDisabled ? "none" : "inherit",
                        }}
                        disabled={scheduleDisabled || meridiemDisabled}
                    />
                );
            });
        } else {
            return null;
        }
    }

    renderStepActions(step) {
        const {stepIndex} = this.state;

        return (
            <div style={{margin: "12px 0"}}>
                <RaisedButton
                    label={stepIndex === 2 ? "Finish" : "Next"}
                    disableTouchRipple={true}
                    disableFocusRipple={true}
                    primary={true}
                    onClick={this.handleNext}
                    backgroundColor="#00C853 !important"
                    style={{marginRight: 12, backgroundColor: "#00C853"}}
                />
                {step > 0 && (
                    <FlatButton
                        label="Back"
                        disabled={stepIndex === 0}
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        onClick={this.handlePrev}
                    />
                )}
            </div>
        );
    }

    render() {
        const {
            finished,
            isLoading,
            smallScreen,
            stepIndex,
            confirmationModalOpen,
            confirmationSnackbarOpen,
            ...data
        } = this.state;
        const contactFormFilled =
            data.firstName &&
            data.lastName &&
            data.phone &&
            data.email &&
            data.validPhone &&
            data.validEmail;
        const DatePickerExampleSimple = () => (
            <div>
                <DatePicker
                    hintText="Seleciona a Data"
                    mode={smallScreen ? "portrait" : "landscape"}
                    onChange={(n, date) => this.handleSetAppointmentDate(date)}
                    shouldDisableDate={(day) => this.checkDisableDate(day)}
                />
            </div>
        );

        const ProfessionalPicker = () => (
            <div>
                <DropDownMenu
                    value={this.state.professional}
                    onChange={this.handleProfessionalChange}
                >
                    <MenuItem value={1} primaryText="Dra. Marcela" />
                    <MenuItem value={2} primaryText="Dr. João" />
                    <MenuItem value={3} primaryText="Dra. Pietra" />
                    <MenuItem value={4} primaryText="Dr. José" />
                </DropDownMenu>
            </div>
        );

        const modalActions = [
            <FlatButton
                label="Cancelar"
                primary={false}
                onClick={() => this.setState({confirmationModalOpen: false})}
            />,
            <FlatButton
                label="Confirmar"
                style={{backgroundColor: "#00C853 !important"}}
                primary={true}
                onClick={() => this.handleSubmit()}
            />,
        ];
        return (
            <div>
                <AppBar
                    title="Agendamento"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                />
                <section
                    style={{
                        maxWidth: !smallScreen ? "80%" : "100%",
                        margin: "auto",
                        marginTop: !smallScreen ? 20 : 0,
                    }}
                >
                    <Card
                        style={{
                            padding: "12px 12px 25px 12px",
                            height: smallScreen ? "100vh" : null,
                        }}
                    >
                        <Stepper
                            activeStep={stepIndex}
                            orientation="vertical"
                            linear={false}
                        >
                            <Step>
                                <StepLabel>Escolha um profissional</StepLabel>
                                <StepContent>
                                    {ProfessionalPicker()}
                                    {this.renderStepActions(0)}
                                </StepContent>
                            </Step>
                            <Step>
                                <StepLabel>
                                    Escolha uma data disponível
                                </StepLabel>
                                <StepContent>
                                    {DatePickerExampleSimple()}
                                    {this.renderStepActions(1)}
                                </StepContent>
                            </Step>
                            <Step disabled={!data.appointmentDate}>
                                <StepLabel>
                                    Escolha um horário dsponível
                                </StepLabel>
                                <StepContent>
                                    <SelectField
                                        floatingLabelText="AM/PM"
                                        value={data.appointmentMeridiem}
                                        onChange={(evt, key, payload) =>
                                            this.handleSetAppointmentMeridiem(
                                                payload
                                            )
                                        }
                                        selectionRenderer={(value) =>
                                            value ? "PM" : "AM"
                                        }
                                    >
                                        <MenuItem value={0} primaryText="AM" />
                                        <MenuItem value={1} primaryText="PM" />
                                    </SelectField>
                                    <RadioButtonGroup
                                        style={{
                                            marginTop: 15,
                                            marginLeft: 15,
                                        }}
                                        name="appointmentTimes"
                                        defaultSelected={data.appointmentSlot}
                                        onChange={(evt, val) =>
                                            this.handleSetAppointmentSlot(val)
                                        }
                                    >
                                        {this.renderAppointmentTimes()}
                                    </RadioButtonGroup>
                                    {this.renderStepActions(2)}
                                </StepContent>
                            </Step>
                            <Step>
                                <StepLabel>
                                    Compartilhe suas informações de contato,
                                    para que possamos enviar um lembrete
                                </StepLabel>
                                <StepContent>
                                    <p>
                                        <section>
                                            <TextField
                                                style={{display: "block"}}
                                                name="first_name"
                                                hintText="Primeiro Nome"
                                                floatingLabelText="Primeiro Nome"
                                                onChange={(evt, newValue) =>
                                                    this.setState({
                                                        firstName: newValue,
                                                    })
                                                }
                                            />
                                            <TextField
                                                style={{display: "block"}}
                                                name="last_name"
                                                hintText="Sobrenome"
                                                floatingLabelText="Sobrenome"
                                                onChange={(evt, newValue) =>
                                                    this.setState({
                                                        lastName: newValue,
                                                    })
                                                }
                                            />
                                            <TextField
                                                style={{display: "block"}}
                                                name="email"
                                                hintText="seuendereco@mail.com"
                                                floatingLabelText="Email"
                                                errorText={
                                                    data.validEmail
                                                        ? null
                                                        : "Escereva um email válido"
                                                }
                                                onChange={(evt, newValue) =>
                                                    this.validateEmail(newValue)
                                                }
                                            />
                                            <TextField
                                                style={{display: "block"}}
                                                name="phone"
                                                hintText="935487415"
                                                floatingLabelText="Telefone"
                                                errorText={
                                                    data.validPhone
                                                        ? null
                                                        : "Escreva um telefone válido"
                                                }
                                                onChange={(evt, newValue) =>
                                                    this.validatePhone(newValue)
                                                }
                                            />
                                            <RaisedButton
                                                style={{
                                                    display: "block",
                                                    backgroundColor: "#00C853",
                                                }}
                                                label={
                                                    contactFormFilled
                                                        ? "Confirmar"
                                                        : "Complete suas informações"
                                                }
                                                labelPosition="before"
                                                primary={true}
                                                fullWidth={true}
                                                onClick={() =>
                                                    this.setState({
                                                        confirmationModalOpen:
                                                            !this.state
                                                                .confirmationModalOpen,
                                                    })
                                                }
                                                disabled={
                                                    !contactFormFilled ||
                                                    data.processed
                                                }
                                                style={{
                                                    marginTop: 20,
                                                    maxWidth: 100,
                                                }}
                                            />
                                        </section>
                                    </p>
                                    {this.renderStepActions(3)}
                                </StepContent>
                            </Step>
                        </Stepper>
                    </Card>
                    <Dialog
                        modal={true}
                        open={confirmationModalOpen}
                        actions={modalActions}
                        title="Confirme sua consulta"
                    >
                        {this.renderAppointmentConfirmation()}
                    </Dialog>
                    <SnackBar
                        open={confirmationSnackbarOpen || isLoading}
                        message={
                            isLoading
                                ? "Loading... "
                                : data.confirmationSnackbarMessage || ""
                        }
                        autoHideDuration={10000}
                        onRequestClose={() =>
                            this.setState({confirmationSnackbarOpen: false})
                        }
                    />
                </section>
            </div>
        );
    }
}
export default AppointmentApp;
