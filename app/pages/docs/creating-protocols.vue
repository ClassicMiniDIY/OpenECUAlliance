<script setup lang="ts">
  useSeoMeta({
    title: 'Creating Protocols - OpenECU Alliance',
    description: 'Step-by-step guide to creating CAN Bus protocol definitions for the OpenECU Alliance.',
  });

  const codeExamples = {
    step1: `git clone https://github.com/YOUR-USERNAME/OpenECUAlliance.git
cd OpenECUAlliance`,

    step2: `mkdir -p specs/protocols/vendorname`,

    step3: `touch specs/protocols/vendorname/vendorname-protocol.protocol.yaml`,

    step4: `openecualliance: "1.0"
type: protocol
id: vendorname-broadcast
name: "VendorName CAN Broadcast Protocol"
version: "1.0.0"
vendor: vendorname
description: |
  CAN broadcast protocol for VendorName ECU series.
  Supports Model A, Model B, and Model C.
website: "https://vendor-website.com/can-protocol"

protocol:
  type: can           # can | canfd | lin | k-line
  baudrate: 1000000   # 1Mbps
  extended_id: false  # Standard 11-bit IDs

messages:
  - id: 0x360
    name: "Engine Data 1"
    length: 8         # Bytes
    interval_ms: 10   # Broadcast rate
    signals:
      - name: "RPM"
        start_bit: 0
        length: 16
        byte_order: little_endian
        data_type: unsigned
        scale: 1.0
        offset: 0
        unit: "rpm"
        min: 0
        max: 20000
        description: "Engine speed"

      - name: "Manifold_Pressure"
        start_bit: 16
        length: 16
        byte_order: little_endian
        data_type: unsigned
        scale: 0.1
        offset: 0
        unit: "kPa"
        min: 0
        max: 400
        description: "Manifold absolute pressure"

  - id: 0x361
    name: "Engine Data 2"
    length: 8
    interval_ms: 10
    signals:
      - name: "Throttle_Position"
        start_bit: 0
        length: 16
        byte_order: little_endian
        data_type: unsigned
        scale: 0.1
        offset: 0
        unit: "%"
        min: 0
        max: 100

      - name: "Coolant_Temp"
        start_bit: 16
        length: 16
        byte_order: little_endian
        data_type: signed
        scale: 0.1
        offset: 0
        unit: "celsius"
        min: -40
        max: 200

# Optional: Enumeration definitions for discrete signals
enums:
  - name: "GearPosition"
    values:
      0: "Neutral"
      1: "First"
      2: "Second"
      3: "Third"
      4: "Fourth"
      5: "Fifth"
      6: "Reverse"

metadata:
  author: "Your Name"
  license: "MIT"
  tested_with:
    - "VendorName Model A"
    - "VendorName Model B"
  compatible_tools:
    - "CANalyzer"
    - "PCAN-View"
    - "SavvyCAN"
  changelog:
    - version: "1.0.0"
      date: "2025-01-06"
      changes:
        - "Initial release with core engine messages"`,

    step5: `# Install validation tool (one-time)
npm install -g ajv-cli

# Validate
ajv validate -s specs/schema/protocol.schema.json -d specs/protocols/vendorname/vendorname-broadcast.protocol.yaml`,

    step6: `git checkout -b add-vendorname-protocol
git add specs/protocols/vendorname/
git commit -m "protocol: Add CAN protocol for VendorName Broadcast"
git push origin add-vendorname-protocol`,

    signalBits: `# Signal position is defined by:
# - start_bit: The first bit of the signal (0-63 for 8-byte messages)
# - length: Number of bits in the signal

# Example: 16-bit RPM starting at bit 0
- name: "RPM"
  start_bit: 0
  length: 16
  # This occupies bits 0-15 (bytes 0-1)

# Example: 8-bit status starting at bit 16
- name: "Status"
  start_bit: 16
  length: 8
  # This occupies bits 16-23 (byte 2)`,

    scalingExample: `# Raw value to engineering value formula:
# engineering_value = (raw_value * scale) + offset

# Example: Temperature in 0.1 degree resolution
- name: "Coolant_Temp"
  scale: 0.1      # Raw 250 = 25.0 degrees
  offset: 0
  unit: "celsius"

# Example: Pressure with offset
- name: "Fuel_Pressure"
  scale: 0.01     # Raw 10000 = 100.00
  offset: -100    # Offset for vacuum reading
  unit: "kPa"`,
  };
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink to="/docs" class="text-sm text-muted hover:text-success inline-flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <UBadge color="success" variant="subtle">Protocol</UBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Creating Protocols</h1>
        <p class="text-lg text-muted">Step-by-step guide to creating CAN Bus protocol definitions.</p>
      </div>

      <!-- What is a Protocol -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">What is a Protocol?</h2>
        <UCard>
          <p class="text-muted mb-4">
            A protocol definition describes the CAN Bus messages and signals broadcast by an ECU. This allows tools to
            decode real-time CAN data into human-readable values like RPM, temperatures, and pressures.
          </p>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">Protocols Include:</h4>
              <ul class="space-y-1 text-sm text-muted">
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-check" class="size-4 text-success" />
                  CAN message IDs and lengths
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-check" class="size-4 text-success" />
                  Signal bit positions and sizes
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-check" class="size-4 text-success" />
                  Scaling factors and offsets
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-check" class="size-4 text-success" />
                  Units and value ranges
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-2">Use Cases:</h4>
              <ul class="space-y-1 text-sm text-muted">
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-signal" class="size-4 text-success" />
                  Real-time CAN data logging
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-signal" class="size-4 text-success" />
                  Digital dashboards
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-signal" class="size-4 text-success" />
                  Data acquisition systems
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-heroicons-signal" class="size-4 text-success" />
                  CANalyzer / PCAN-View integration
                </li>
              </ul>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Before You Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Before You Start</h2>
        <UCard>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Get official documentation</strong> - Find the vendor's CAN protocol specification document if
                available.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Test with real hardware</strong> - Verify signals using a CAN interface and the actual ECU.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Check existing protocols</strong> - Ensure a protocol doesn't already exist for your ECU.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Understand CAN basics</strong> - Familiarity with message IDs, byte order, and bit packing
                helps.
              </div>
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Step by Step -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Step-by-Step Guide</h2>

        <!-- Step 1 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-success text-success-foreground rounded-full font-bold shrink-0"
            >
              1
            </div>
            <h3 class="text-xl font-semibold">Fork and Clone</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step1" />
          </UCard>
        </div>

        <!-- Step 2 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-success text-success-foreground rounded-full font-bold shrink-0"
            >
              2
            </div>
            <h3 class="text-xl font-semibold">Create Vendor Directory</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step2" />
            <p class="text-sm text-muted mt-3">
              Use lowercase vendor names:
              <code class="bg-muted px-1 rounded">haltech</code>, <code class="bg-muted px-1 rounded">link</code>,
              <code class="bg-muted px-1 rounded">motec</code>, <code class="bg-muted px-1 rounded">aem</code>, etc.
            </p>
            <p class="text-sm text-muted mt-2">
              All protocol files go in
              <code class="bg-muted px-1 rounded">specs/protocols/[vendor]/</code> within this repository.
            </p>
          </UCard>
        </div>

        <!-- Step 3 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-success text-success-foreground rounded-full font-bold shrink-0"
            >
              3
            </div>
            <h3 class="text-xl font-semibold">Create Protocol File</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step3" />
            <p class="text-sm text-muted mt-3">
              Naming convention:
              <code class="bg-muted px-1 rounded">{vendor}-{protocol}.protocol.yaml</code>
            </p>
            <div class="mt-2 text-sm text-muted">
              Examples:
              <code class="bg-muted px-1 rounded">haltech-elite-broadcast.protocol.yaml</code>,
              <code class="bg-muted px-1 rounded">link-g4x-broadcast.protocol.yaml</code>
            </div>
          </UCard>
        </div>

        <!-- Step 4 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-success text-success-foreground rounded-full font-bold shrink-0"
            >
              4
            </div>
            <h3 class="text-xl font-semibold">Write the Protocol</h3>
          </div>
          <UCard>
            <CodeBlock lang="yaml" :code="codeExamples.step4" />
          </UCard>
        </div>

        <!-- Step 5 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-success text-success-foreground rounded-full font-bold shrink-0"
            >
              5
            </div>
            <h3 class="text-xl font-semibold">Validate Your Protocol</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step5" />
          </UCard>
        </div>

        <!-- Step 6 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-success text-success-foreground rounded-full font-bold shrink-0"
            >
              6
            </div>
            <h3 class="text-xl font-semibold">Submit Pull Request</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step6" />
            <p class="text-sm text-muted mt-3">
              Then create a Pull Request on GitHub. Once merged, your protocol is instantly available via the public
              API!
            </p>
          </UCard>
        </div>
      </section>

      <!-- Understanding Signal Bits -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Understanding Signal Bits</h2>
        <UCard>
          <p class="text-muted mb-4">
            CAN signals are packed into messages at specific bit positions. Each signal has a start bit and length.
          </p>
          <CodeBlock lang="yaml" :code="codeExamples.signalBits" />
        </UCard>
      </section>

      <!-- Scaling and Offsets -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Scaling and Offsets</h2>
        <UCard>
          <p class="text-muted mb-4">Raw CAN values are converted to engineering units using scale and offset:</p>
          <CodeBlock lang="yaml" :code="codeExamples.scalingExample" />
        </UCard>
      </section>

      <!-- Quality Checklist -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Quality Checklist</h2>
        <UCard>
          <p class="text-muted mb-4">Before submitting, verify:</p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Protocol validates against JSON Schema
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              All required fields are present
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Message IDs are in hexadecimal format
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Signal bit positions don't overlap
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Byte order matches ECU documentation
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Scale and offset values are correct
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              <code class="bg-muted px-1 rounded">metadata.tested_with</code>
              lists ECUs tested
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Protocol has been verified with real CAN data
            </li>
          </ul>
        </UCard>
      </section>

      <!-- DBC Export -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">DBC Export</h2>
        <UCard>
          <p class="text-muted mb-4">
            Protocols in the OpenECU Alliance can be exported to DBC format for use with industry-standard tools like
            CANalyzer, PCAN-View, and SavvyCAN.
          </p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              CANalyzer compatible
            </div>
            <div class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              PCAN-View compatible
            </div>
            <div class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              SavvyCAN compatible
            </div>
          </div>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton
          to="https://github.com/ClassicMiniDIY/OpenECUAlliance"
          target="_blank"
          icon="i-simple-icons-github"
          color="success"
          size="lg"
        >
          View on GitHub
        </UButton>
        <UButton to="/protocols" color="neutral" variant="outline" icon="i-heroicons-signal" size="lg">
          Browse Protocols
        </UButton>
        <UButton to="/spec" color="neutral" variant="outline" icon="i-heroicons-document-text" size="lg">
          Read the Full Spec
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
