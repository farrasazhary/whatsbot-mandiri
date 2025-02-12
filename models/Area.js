import mongoose from "mongoose";

const { Schema } = mongoose;

const areaSchema = new Schema({
  kode_area: { type: String, required: true },
  nama_area: { type: String, required: true }
});

const Area = mongoose.model('Area', areaSchema);

export default Area;
