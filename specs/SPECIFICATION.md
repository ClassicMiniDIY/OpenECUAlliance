# OpenECU Spec — Channel Reference

**Spec version 1.0 · registry 1.0.0 · updated 2026-08-24**

This is the canonical channel vocabulary for the OpenECU Spec. It is generated
from [`channels.yaml`](channels.yaml), which is the machine-readable source of
truth — **edit that file, not this one.**

Regenerate with:

```bash
bun scripts/generate-spec-doc.ts
```

---

## Why this file exists

An adapter maps a vendor's own column names onto a canonical channel ID, so an
application can read `rpm` from a Haltech log and a Link log without knowing
anything about either vendor. That only works if every adapter agrees on what
`rpm` means — the same ID, the same category, the same unit.

Until 2026-08-24 this file was referenced by the contributor docs but did not
exist, and the vocabulary was defined implicitly by whatever the nine adapters
happened to use. Eight IDs had drifted onto incompatible units: `map` was kPa
in seven adapters, psi in one and mbar in another. A consumer that trusted the
ID alone got readings off by an order of magnitude.

---

## The rules

1. **Every adapter channel `id` and every protocol signal `id` must appear in
   this registry**, either as a canonical ID or as a listed alias.
2. **`unit` on an adapter channel describes the log file, not the ideal.** If a
   vendor writes psi, the adapter says `psi`. Never rewrite it to look canonical
   — that makes the spec lie about the file.
3. **When the source unit differs from the canonical unit, declare the
   conversion** on the channel:

   ```yaml
   - id: map
     unit: psi
     to_canonical:
       scale: 6.89475729
       offset: 0
   ```

   A consumer computes `canonical = raw * scale + offset`. Adapters already in
   the canonical unit omit `to_canonical` entirely.
4. **Category must match the registry.** It drives grouping on the site.
5. **Aliases still resolve** but are deprecated. New adapters should use the
   canonical ID.
6. **Adding a channel?** Add it to `channels.yaml` first, then use it. Run
   `bun run validate:specs` before opening a PR — CI runs it too.

---

## Units

One spelling per unit. The validator rejects anything else.

| quantity | canonical unit |
| --- | --- |
| pressure | `kpa` |
| temperature | `celsius` |
| speed | `kph` |
| angle | `degrees` |
| angular rate | `deg/s` |
| proportion | `percent` |
| air-fuel | `lambda`, `afr` |
| mass flow | `g/s` |
| volume flow | `l/h` |
| voltage | `volts` |
| length | `meters`, `millimeters` |
| acceleration | `g` |
| frequency | `hz` |
| time | `seconds`, `milliseconds` |
| torque | `nm` |
| engine speed | `rpm` |

### Accepted spellings

These normalise with no numeric change:

| written | canonical |
| --- | --- |
| `%` | `percent` |
| `c` | `celsius` |
| `deg` | `degrees` |
| `deg/sec` | `deg/s` |
| `kPa` | `kpa` |
| `km/h` | `kph` |
| `ms` | `milliseconds` |
| `pct` | `percent` |
| `s` | `seconds` |
| `v` | `volts` |
| `°c` | `celsius` |

### Conversions

`canonical = raw * scale + offset`

| from | to | scale | offset |
| --- | --- | --- | --- |
| `psi` | `kpa` | 6.89475729 | 0 |
| `bar` | `kpa` | 100 | 0 |
| `mbar` | `kpa` | 0.1 | 0 |
| `mph` | `kph` | 1.609344 | 0 |
| `milliseconds` | `seconds` | 0.001 | 0 |
| `cc/min` | `l/h` | 0.06 | 0 |
| `fahrenheit` | `celsius` | 0.5555555556 | -17.7777778 |

---

## Channels

140 canonical channels across 19 categories. **Used by**
counts how many of the nine adapters currently map the channel.

### acceleration

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `g_lateral` | Lateral G | `g` | float | 1 | Lateral acceleration (positive = right) |
| `g_longitudinal` | Longitudinal G | `g` | float | 1 | Longitudinal acceleration (positive = acceleration) |
| `g_vertical` | Vertical G | `g` | float | 1 | Vertical acceleration |

### correction

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `accel_enrichment` | Acceleration Enrichment | `percent` | float | 2 | Transient fuel enrichment |
| `af_learning` | A/F Learning | `percent` | float | 1 | Long-term fuel trim / A/F Learning value |
| `afr_correction` | A/F Correction | `percent` | float | 1 | Short-term fuel trim from A/F sensor |
| `barometric_correction` | Barometric Correction | `percent` | float | 1 | Altitude/barometric fuel correction |
| `clt_correction` | CLT Correction | `percent` | float | 2 | Coolant temperature fuel correction |
| `dam` | DAM | `multiplier` | float | 1 | Dynamic Advance Multiplier |
| `ect_fuel_trim` | ECT Fuel Trim | `percent` | float | 1 | Coolant temperature fuel trim |
| `ego_correction` | EGO Correction | `percent` | float | 2 | Closed-loop O2 correction |
| `ego_correction_1` | EGO Correction Bank 1 | `percent` | float | 1 | EGO correction for bank 1 |
| `ego_correction_2` | EGO Correction Bank 2 | `percent` | float | 1 | EGO correction for bank 2 |
| `feedback_knock` | Feedback Knock Correction | `degrees` | float | 1 | Real-time knock retard |
| `fine_knock_learning` | Fine Knock Learning | `degrees` | float | 1 | Fine knock learning value per cylinder |
| `fuel_correction` | Fuel Correction | `percent` | float | 1 | Active fuel correction percentage |
| `fuel_trim` | Closed Loop Trim | `percent` | float | 2 | Closed loop fuel trim |
| `gamma_enrichment` | Gamma Enrichment | `percent` | float | 1 | Total fuel correction multiplier |
| `iam` | IAM | `multiplier` | float | 1 | Ignition Advance Multiplier (Subaru learning value) |
| `iat_correction` | IAT Correction | `percent` | float | 2 | Intake air temperature fuel correction |
| `iat_fuel_trim` | IAT Fuel Trim | `percent` | float | 1 | Intake air temperature fuel trim |
| `knock_retard` | Knock Retard | `degrees` | float | 4 | Timing retard from knock detection |
| `warmup_enrichment` | Warmup Enrichment | `percent` | float | 3 | Cold engine fuel enrichment |

### custom

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `accel_x` | Acceleration X | `g` | float | 1 | Lateral acceleration |
| `accel_y` | Acceleration Y | `g` | float | 1 | Longitudinal acceleration |
| `aux_input_1` | Auxiliary Input 1 | `—` | float | 1 | Generic auxiliary input channel |
| `aux_input_2` | Auxiliary Input 2 | `—` | float | 1 | Generic auxiliary input channel |

### diagnostics

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `mil` | MIL | `—` | bool | 1 | Malfunction indicator lamp status (ON/OFF) |

### driver_input

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `steering_angle` | Steering Angle | `degrees` | float | 1 | Steering wheel angle |

### drivetrain

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `gear` | Gear Position | `gear` | int | 7 | Current gear |

### electrical

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `an_volt_1` | Analog Voltage 1 | `volts` | float | 1 | Analog input 1 voltage |
| `an_volt_2` | Analog Voltage 2 | `volts` | float | 1 | Analog input 2 voltage |
| `an_volt_3` | Analog Voltage 3 | `volts` | float | 1 | Analog input 3 voltage |
| `an_volt_4` | Analog Voltage 4 | `volts` | float | 1 | Analog input 4 voltage |
| `analog_d14` | Analog D14 | `volts` | float | 1 | Analog input D14 voltage |
| `battery_voltage` | Battery Voltage | `volts` | float | 9 | System voltage |
| `eld_voltage` | ELD Voltage | `volts` | float | 1 | Electrical load detector voltage |
| `maf_voltage` | MAF Voltage | `volts` | float | 1 | Mass airflow sensor voltage |
| `map_voltage` | MAP Voltage | `volts` | float | 1 | Raw MAP sensor voltage |
| `tps_voltage` | TPS Voltage | `volts` | float | 1 | Raw throttle position sensor voltage |

### engine

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `ap_main` | Accelerator Position Main | `percent` | float | 1 | Main accelerator pedal position |
| `ap_sub` | Accelerator Position Sub | `percent` | float | 1 | Secondary accelerator pedal position |
| `etb_error` | ETB Error | `percent` | float | 1 | Electronic throttle body position error |
| `etb_position` | Electronic Throttle Position<br>_aliases: `dbw_position`, `e_throttle_position`_ | `percent` | float | 2 | Measured electronic throttle body plate position. |
| `etb_target` | Electronic Throttle Target<br>_aliases: `dbw_target`, `e_throttle_target`_ | `percent` | float | 3 | Commanded electronic throttle body plate position. |
| `idle_base` | Idle Base Position | `percent` | float | 1 | Idle stepper or solenoid base position |
| `idle_load` | Idle Load | `percent` | float | 1 | Idle air control position |
| `idle_position` | Idle Position | `percent` | float | 1 | Idle air control position |
| `idle_target_rpm` | Idle Target RPM<br>_aliases: `idle_target`_ | `rpm` | float | 2 | Target idle speed |
| `idle_valve` | Idle Valve Position | `percent` | float | 1 | Idle air control valve position |
| `launch_rpm_target` | Launch RPM Target | `rpm` | float | 1 | Launch control target RPM |
| `load` | Engine Load | `percent` | float | 3 | Calculated engine load |
| `maf` | Mass Airflow | `g/s` | float | 2 | Mass airflow sensor reading |
| `pedal_position` | Accelerator Pedal | `percent` | float | 1 | Accelerator pedal position |
| `rpm` | Engine RPM | `rpm` | float | 9 | Engine speed |
| `torque_requested` | Torque Requested | `nm` | float | 1 | Requested torque from torque management |
| `tps` | Throttle Position | `percent` | float | 8 | Throttle position sensor |
| `tps_2` | Throttle Position 2 | `percent` | float | 3 | Secondary throttle position sensor |
| `tps_main` | Throttle Position Main | `percent` | float | 1 | Main throttle position sensor |
| `tps_sub` | Throttle Position Sub | `percent` | float | 1 | Secondary throttle position sensor |
| `vvt_exhaust` | VVT Exhaust Position<br>_aliases: `vvt_exhaust_actual`_ | `degrees` | float | 3 | Variable valve timing exhaust cam position |
| `vvt_exhaust_target` | VVT Exhaust Target | `degrees` | float | 1 | Target exhaust cam position |
| `vvt_intake` | VVT Intake Position<br>_aliases: `vvt_intake_actual`_ | `degrees` | float | 3 | Variable valve timing intake cam position |
| `vvt_intake_target` | VVT Intake Target | `degrees` | float | 1 | Target intake cam position |
| `wastegate_duty` | Wastegate Duty Cycle | `percent` | float | 2 | Wastegate solenoid duty cycle |

### fuel

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `afr` | Air-Fuel Ratio<br>_aliases: `plx_afr`_ | `afr` | float | 10 | Measured AFR from O2 sensor |
| `afr_1` | AFR Bank 1 | `afr` | float | 1 | Air-fuel ratio from bank 1 / sensor 1 |
| `afr_2` | AFR Bank 2 | `afr` | float | 1 | Air-fuel ratio from bank 2 / sensor 2 |
| `afr_target` | AFR Target | `afr` | float | 4 | Target AFR from tune |
| `duty_cycle` | Injector Duty Cycle<br>_aliases: `injector_duty`_ | `percent` | float | 8 | Injector duty cycle |
| `fuel_cut` | Fuel Cut | `—` | bool | 1 | Fuel cut active flag |
| `fuel_flow` | Fuel Flow Rate | `l/h` | float | 3 | Instantaneous fuel flow rate |
| `fuel_flow_mass` | Fuel Flow Rate (Mass) | `g/s` | float | 1 | Mass fuel flow. Not convertible to volumetric flow without fuel density. |
| `fuel_value` | Fuel Value | `—` | float | 1 | Fuel enrichment / VE lookup value |
| `lambda` | Lambda | `lambda` | float | 6 | Lambda value from wideband O2 |
| `lambda_2` | Lambda 2 | `lambda` | float | 4 | Lambda value from second wideband O2 |
| `lambda_target` | Lambda Target | `lambda` | float | 3 | Target lambda from ECU tuning |
| `pulse_width` | Injector Pulse Width<br>_aliases: `injector_pw`_ | `milliseconds` | float | 7 | Injector pulse width |
| `ve` | VE | `percent` | float | 3 | Volumetric Efficiency from VE table |

### ignition

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `dwell` | Dwell | `milliseconds` | float | 5 | Coil dwell time |
| `ignition_advance` | Ignition Advance | `degrees` | float | 8 | Spark timing advance |
| `ignition_table` | Ignition Table | `degrees` | float | 1 | Base ignition timing from table lookup |
| `knock_count` | Knock Count | `count` | int | 1 | Number of knock events detected |
| `knock_level` | Knock Level | `volts` | float | 2 | Knock sensor signal level |
| `knock_level_1` | Knock Level 1 | `volts` | float | 1 | Knock sensor 1 signal level |
| `knock_level_2` | Knock Level 2 | `volts` | float | 1 | Knock sensor 2 signal level |
| `knock_level_db` | Knock Level (dB) | `decibels` | float | 1 | Knock level on a logarithmic dB scale. Not linearly convertible to the voltage form. |
| `spark_cut` | Spark Cut | `—` | bool | 1 | Spark cut active flag |

### position

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `distance` | Distance | `meters` | float | 1 | Total distance traveled |
| `gps_altitude` | GPS Altitude | `meters` | float | 1 | GPS altitude above sea level |
| `gps_heading` | GPS Heading | `degrees` | float | 1 | GPS heading/course |
| `gps_latitude` | GPS Latitude | `degrees` | float | 1 | GPS latitude position |
| `gps_longitude` | GPS Longitude | `degrees` | float | 1 | GPS longitude position |

### pressure

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `barometric_pressure` | Barometric Pressure<br>_aliases: `baro`, `barometric`_ | `kpa` | float | 6 | Atmospheric pressure |
| `boost` | Boost Pressure<br>_aliases: `plx_boost`_ | `kpa` | float | 6 | Boost pressure (gauge) |
| `boost_duty` | Boost Duty | `percent` | float | 4 | Boost solenoid duty cycle |
| `boost_target` | Boost Target<br>_aliases: `target_boost`_ | `kpa` | float | 6 | Target boost from boost control |
| `brake_pressure_front` | Brake Pressure Front | `kpa` | float | 1 | Front brake line pressure |
| `brake_pressure_rear` | Brake Pressure Rear | `kpa` | float | 1 | Rear brake line pressure |
| `fuel_pressure` | Fuel Pressure | `kpa` | float | 6 | Fuel rail pressure |
| `map` | Manifold Pressure | `kpa` | float | 9 | Manifold absolute pressure |
| `mgp` | Manifold Gauge Pressure | `kpa` | float | 1 | Manifold gauge pressure (relative) |
| `oil_pressure` | Oil Pressure | `kpa` | float | 5 | Engine oil pressure |

### rotation

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `gyro_pitch` | Pitch Rate | `deg/s` | float | 1 | Pitch rotation rate |
| `gyro_roll` | Roll Rate | `deg/s` | float | 1 | Roll rotation rate |
| `gyro_yaw` | Yaw Rate | `deg/s` | float | 1 | Yaw rotation rate |

### speed

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `vehicle_speed` | Vehicle Speed | `kph` | float | 8 | Vehicle ground speed |
| `wheel_speed_fl` | Wheel Speed FL | `kph` | float | 2 | Front left wheel speed |
| `wheel_speed_fr` | Wheel Speed FR | `kph` | float | 2 | Front right wheel speed |
| `wheel_speed_rl` | Wheel Speed RL | `kph` | float | 2 | Rear left wheel speed |
| `wheel_speed_rr` | Wheel Speed RR | `kph` | float | 2 | Rear right wheel speed |

### suspension

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `suspension_fl` | Suspension FL | `millimeters` | float | 1 | Front left suspension travel |
| `suspension_fr` | Suspension FR | `millimeters` | float | 1 | Front right suspension travel |
| `suspension_rl` | Suspension RL | `millimeters` | float | 1 | Rear left suspension travel |
| `suspension_rr` | Suspension RR | `millimeters` | float | 1 | Rear right suspension travel |

### system

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `cpu_load` | CPU Load | `percent` | float | 1 | ECU CPU utilization |
| `ecu_temp` | ECU Temperature | `celsius` | float | 1 | ECU internal temperature |
| `error_code` | Error Code | `code` | int | 1 | Active error/fault code |
| `free_ram` | Free RAM | `bytes` | float | 1 | Available memory |
| `gps_satellites` | GPS Satellites | `count` | int | 1 | Number of GPS satellites in view |
| `loops_per_second` | Loops Per Second | `hz` | float | 2 | ECU loop rate |
| `time` | Time | `seconds` | float | 3 | Log timestamp in seconds |
| `trigger_error_counter` | Trigger Errors | `count` | int | 1 | Trigger synchronization error count |

### temperature

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `aux_temp_1` | Aux Temperature 1 | `celsius` | float | 1 | Auxiliary temperature sensor 1 |
| `aux_temp_2` | Aux Temperature 2 | `celsius` | float | 1 | Auxiliary temperature sensor 2 |
| `charge_temp` | Charge Temperature | `celsius` | float | 1 | Intake charge temperature estimate |
| `coolant_temp` | Coolant Temperature | `celsius` | float | 9 | Engine coolant temperature |
| `egt_1` | EGT Cylinder 1<br>_aliases: `egt`, `exhaust_temp`, `plx_egt`_ | `celsius` | float | 5 | Exhaust gas temperature for cylinder 1 |
| `egt_2` | EGT Cylinder 2<br>_aliases: `exhaust_temp_2`_ | `celsius` | float | 2 | Exhaust gas temperature for cylinder 2 |
| `egt_3` | EGT Cylinder 3<br>_aliases: `exhaust_temp_3`_ | `celsius` | float | 1 | Exhaust gas temperature, cylinder or position 3. |
| `egt_4` | EGT Cylinder 4<br>_aliases: `exhaust_temp_4`_ | `celsius` | float | 1 | Exhaust gas temperature, cylinder or position 4. |
| `fuel_temp` | Fuel Temperature | `celsius` | float | 3 | Fuel temperature |
| `gearbox_temp` | Gearbox Temperature | `celsius` | float | 2 | Transmission oil temperature |
| `iat` | Intake Air Temperature | `celsius` | float | 9 | Intake air temperature |
| `oil_temp` | Oil Temperature | `celsius` | float | 6 | Engine oil temperature |

### timing

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `best_lap_time` | Best Lap Time | `seconds` | float | 1 | Best lap time in session |
| `lap_number` | Lap Number | `lap` | int | 1 | Current lap number |
| `lap_time` | Lap Time | `seconds` | float | 1 | Current lap time |

### traction

| id | name | unit | type | used by | description |
| --- | --- | --- | --- | --- | --- |
| `traction_cut` | Traction Cut | `percent` | float | 1 | Traction control ignition cut percentage |
| `traction_slip` | Traction Slip | `percent` | float | 1 | Wheel slip percentage |

---

## Deprecated aliases

Recognised for backward compatibility. Do not use in new adapters.

| deprecated | use instead |
| --- | --- |
| `baro` | `barometric_pressure` |
| `barometric` | `barometric_pressure` |
| `dbw_position` | `etb_position` |
| `dbw_target` | `etb_target` |
| `e_throttle_position` | `etb_position` |
| `e_throttle_target` | `etb_target` |
| `egt` | `egt_1` |
| `exhaust_temp` | `egt_1` |
| `exhaust_temp_2` | `egt_2` |
| `exhaust_temp_3` | `egt_3` |
| `exhaust_temp_4` | `egt_4` |
| `idle_target` | `idle_target_rpm` |
| `injector_duty` | `duty_cycle` |
| `injector_pw` | `pulse_width` |
| `plx_afr` | `afr` |
| `plx_boost` | `boost` |
| `plx_egt` | `egt_1` |
| `target_boost` | `boost_target` |
| `vvt_exhaust_actual` | `vvt_exhaust` |
| `vvt_intake_actual` | `vvt_intake` |

---

## Split channels

These were one ID carrying two physically different measurements. They are not
inter-convertible, so they became separate channels rather than a unit
conversion.

| id | split from | unit | why |
| --- | --- | --- | --- |
| `fuel_flow_mass` | `fuel_flow` | `g/s` | Mass fuel flow. Not convertible to volumetric flow without fuel density. |
| `knock_level_db` | `knock_level` | `decibels` | Knock level on a logarithmic dB scale. Not linearly convertible to the voltage form. |
