<script setup lang="ts">
useSeoMeta({
  title: "Branding Guidelines - OpenECU Alliance",
  description:
    "How to properly use OpenECU Alliance trademarks, logos, and terminology.",
});

const terminology = [
  {
    term: "OpenECU Alliance",
    definition: "The organization that maintains standards and projects",
    example: "The governing body",
  },
  {
    term: "OpenECU Spec",
    definition: "The technical specification for adapter formats",
    example: "This repository",
  },
  {
    term: "OpenECU Spec-Compatible",
    definition: "Third-party applications implementing the spec",
    example: "UltraLog, TunerPro",
  },
  {
    term: "OpenECU Alliance Project",
    definition: "Projects officially maintained by the Alliance",
    example: "Future donated projects",
  },
];

const namingConventions = [
  {
    context: "The organization",
    correct: "OpenECU Alliance",
    incorrect: 'Open ECU Alliance, OECUA, "The Alliance" (alone)',
  },
  {
    context: "The specification",
    correct: "OpenECU Spec",
    incorrect: 'OpenECU Specification, OECUA Spec, "The Spec"',
  },
  {
    context: "Compatible apps",
    correct: "OpenECU Spec-Compatible",
    incorrect: "OpenECU Compatible, Alliance Compatible",
  },
  {
    context: "Alliance projects",
    correct: "OpenECU Alliance Project",
    incorrect: "Alliance Project, Official Project",
  },
];

const acceptableDescriptions = [
  "OpenECU Spec-Compatible",
  "Implements the OpenECU Spec",
  "Supports OpenECU Spec adapters",
  "Compatible with OpenECU Spec 1.0",
];

const unacceptableDescriptions = [
  "Official OpenECU application",
  "OpenECU Certified (without formal certification)",
  "Endorsed by OpenECU Alliance (without endorsement)",
  "OpenECU Alliance Partner (without partnership)",
];

const badgeAssets = [
  {
    name: "Alliance Logo",
    usage: "Alliance materials only",
    availability: "Restricted",
    color: "error",
  },
  {
    name: "Spec Logo",
    usage: "Spec documentation",
    availability: "Open use with attribution",
    color: "success",
  },
  {
    name: "Compatibility Badge",
    usage: "Spec-compatible apps",
    availability: "Open use (self-certified)",
    color: "success",
  },
  {
    name: "Certified Badge",
    usage: "Formally certified apps",
    availability: "After certification",
    color: "warning",
  },
  {
    name: "Alliance Project Badge",
    usage: "Donated projects",
    availability: "Alliance Projects only",
    color: "warning",
  },
];

const logoDos = [
  "Use official assets from openecualliance.org/brand",
  "Maintain minimum clear space around logos",
  "Use on white or light backgrounds",
  "Link to openecualliance.org when possible",
];

const logoDonts = [
  "Modify, distort, or recolor logos",
  "Use logos as part of your own logo",
  "Imply endorsement without authorization",
  "Use Alliance logo for non-Alliance projects",
];

const trademarks = [
  "OpenECU Alliance",
  "OpenECU Spec",
  "OpenECU Alliance logo",
  "OpenECU Spec logo",
];

const fairUse = [
  "Truthful references to the specification",
  "Compatibility statements",
  "Editorial or educational purposes",
];

const permissionRequired = [
  'Use "OpenECU" in a product name',
  "Use the Alliance logo",
  'Claim "Official" or "Certified" status',
  "Create derivative logos or badges",
];

const canSay = [
  "Implements the OpenECU Spec",
  "OpenECU Spec-Compatible",
  "Supports OpenECU Spec adapters",
  "Compatible with OpenECU Spec version 1.0",
  "Verified against OpenECU Spec compliance tests",
];

const cannotSay = [
  "Official OpenECU application",
  "OpenECU Certified (without formal certification)",
  "Endorsed by OpenECU Alliance",
  "OpenECU Alliance Partner",
  "Powered by OpenECU Alliance",
  'Using "OpenECU" in product name',
];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink
          to="/docs"
          class="text-sm text-muted hover:text-primary inline-flex items-center gap-1"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <UBadge color="primary" variant="subtle" class="mb-4">
          Version 1.0.0
        </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Branding Guidelines</h1>
        <p class="text-lg text-muted">
          How to properly use OpenECU Alliance trademarks, logos, and
          terminology.
        </p>
      </div>

      <!-- Key Terminology -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Key Terminology</h2>
        <UCard>
          <p class="text-muted mb-4">
            Understanding the distinction between these terms is critical:
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Term</th>
                  <th class="text-left py-2 pr-4 font-semibold">Definition</th>
                  <th class="text-left py-2 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in terminology"
                  :key="item.term"
                  class="border-b border-default"
                >
                  <td class="py-2 pr-4 font-medium">{{ item.term }}</td>
                  <td class="py-2 pr-4 text-muted">{{ item.definition }}</td>
                  <td class="py-2 text-muted">{{ item.example }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Visual Distinction -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Visual Distinction</h2>
        <UCard>
          <div class="bg-muted/30 p-6 rounded-lg">
            <div class="text-center mb-6">
              <h3 class="text-lg font-bold mb-1">OpenECU Alliance</h3>
              <p class="text-sm text-muted">(The Organization)</p>
            </div>

            <div
              class="border-2 border-dashed border-default rounded-lg p-4 mb-4"
            >
              <div class="text-center mb-4">
                <h4 class="font-semibold">OpenECU Spec</h4>
                <p class="text-sm text-muted">
                  (The Specification - Published and maintained by the Alliance)
                </p>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="border border-default rounded-lg p-4">
                <h4 class="font-semibold mb-2">Alliance Projects</h4>
                <ul class="text-sm text-muted space-y-1">
                  <li>- Maintained by the Alliance</li>
                  <li>- Donated by community</li>
                  <li>- Official support</li>
                </ul>
              </div>
              <div class="border border-default rounded-lg p-4">
                <h4 class="font-semibold mb-2">Spec-Compatible Apps</h4>
                <ul class="text-sm text-muted space-y-1">
                  <li>- Independent developers</li>
                  <li>- Implement the spec</li>
                  <li>- Self-certified or formally certified</li>
                </ul>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Naming Conventions -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Naming Conventions</h2>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Context</th>
                  <th class="text-left py-2 pr-4 font-semibold">
                    <span class="text-success">Correct</span>
                  </th>
                  <th class="text-left py-2 font-semibold">
                    <span class="text-error">Incorrect</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in namingConventions"
                  :key="item.context"
                  class="border-b border-default"
                >
                  <td class="py-2 pr-4 text-muted">{{ item.context }}</td>
                  <td class="py-2 pr-4 text-success">{{ item.correct }}</td>
                  <td class="py-2 text-error">{{ item.incorrect }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 class="font-semibold mb-2">First Reference Rule</h4>
            <p class="text-sm text-muted mb-2">
              On first reference in any document, use the full name:
            </p>
            <p class="text-sm italic">
              "UltraLog is an
              <strong>OpenECU Spec-Compatible</strong> application..."
            </p>
            <p class="text-sm text-muted mt-2">
              Subsequent references may use abbreviated forms.
            </p>
          </div>
        </UCard>
      </section>

      <!-- Product Naming -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Product Naming</h2>
        <UCard>
          <div class="bg-error/10 border border-error/30 p-4 rounded-lg mb-4">
            <p class="text-sm font-medium text-error mb-2">
              DO NOT include "OpenECU" in your product name
            </p>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="p-4 bg-success/10 rounded-lg">
              <p class="text-sm text-success font-medium mb-1">CORRECT</p>
              <p class="text-sm">
                "UltraLog - OpenECU Spec-Compatible Log Viewer"
              </p>
            </div>
            <div class="p-4 bg-error/10 rounded-lg">
              <p class="text-sm text-error font-medium mb-1">INCORRECT</p>
              <p class="text-sm">
                "OpenECU UltraLog" or "UltraLog OpenECU Edition"
              </p>
            </div>
          </div>
          <p class="text-sm text-muted mt-4">
            <strong>Exception:</strong> Alliance Projects may use "OpenECU" in
            product names with Steering Committee approval.
          </p>
        </UCard>
      </section>

      <!-- Describing Your Application -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Describing Your Application</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-3 text-success">Acceptable</h3>
            <ul class="space-y-2">
              <li
                v-for="desc in acceptableDescriptions"
                :key="desc"
                class="flex items-center gap-2 text-sm"
              >
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                {{ desc }}
              </li>
            </ul>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-3 text-error">NOT Acceptable</h3>
            <ul class="space-y-2">
              <li
                v-for="desc in unacceptableDescriptions"
                :key="desc"
                class="flex items-center gap-2 text-sm"
              >
                <UIcon name="i-heroicons-x-mark" class="size-4 text-error" />
                {{ desc }}
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Logo and Badge Usage -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Logo and Badge Usage</h2>

        <UCard class="mb-4">
          <h3 class="font-semibold mb-4">Available Assets</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Asset</th>
                  <th class="text-left py-2 pr-4 font-semibold">Usage</th>
                  <th class="text-left py-2 font-semibold">Availability</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="asset in badgeAssets"
                  :key="asset.name"
                  class="border-b border-default"
                >
                  <td class="py-2 pr-4 font-medium">{{ asset.name }}</td>
                  <td class="py-2 pr-4 text-muted">{{ asset.usage }}</td>
                  <td class="py-2">
                    <UBadge :color="asset.color" variant="subtle" size="md">
                      {{ asset.availability }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>

        <UCard class="mb-4">
          <h3 class="font-semibold mb-4">Compatibility Badges</h3>
          <p class="text-sm text-muted mb-4">
            Available for self-certified applications:
          </p>
          <div class="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <div class="border border-default rounded p-3 inline-block">
              <div class="text-center">
                <div class="font-semibold">OpenECU Spec Compatible</div>
                <div class="text-sm text-muted">Level 2</div>
                <div class="text-sm text-muted">v1.0</div>
              </div>
            </div>
          </div>
          <div class="text-sm text-muted">
            <p class="font-medium mb-2">Requirements for badge use:</p>
            <ul class="space-y-1">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Meet all requirements for claimed compliance level
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Link badge to compliance documentation
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Include spec version number
              </li>
            </ul>
          </div>
        </UCard>

        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-3 text-success">Logo DOs</h3>
            <ul class="space-y-2">
              <li
                v-for="item in logoDos"
                :key="item"
                class="flex items-start gap-2 text-sm"
              >
                <UIcon
                  name="i-heroicons-check"
                  class="size-4 text-success shrink-0 mt-0.5"
                />
                {{ item }}
              </li>
            </ul>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-3 text-error">Logo DON'Ts</h3>
            <ul class="space-y-2">
              <li
                v-for="item in logoDonts"
                :key="item"
                class="flex items-start gap-2 text-sm"
              >
                <UIcon
                  name="i-heroicons-x-mark"
                  class="size-4 text-error shrink-0 mt-0.5"
                />
                {{ item }}
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Trademark Guidelines -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Trademark Guidelines</h2>
        <div class="space-y-4">
          <UCard>
            <h3 class="font-semibold mb-3">Trademarks</h3>
            <p class="text-sm text-muted mb-3">
              The following are trademarks of the OpenECU Alliance:
            </p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tm in trademarks"
                :key="tm"
                color="neutral"
                variant="subtle"
              >
                {{ tm }}
              </UBadge>
            </div>
          </UCard>

          <div class="grid sm:grid-cols-2 gap-4">
            <UCard>
              <h3 class="font-semibold mb-3">
                Fair Use (No Permission Needed)
              </h3>
              <ul class="space-y-2">
                <li
                  v-for="item in fairUse"
                  :key="item"
                  class="flex items-center gap-2 text-sm text-muted"
                >
                  <UIcon name="i-heroicons-check" class="size-4 text-success" />
                  {{ item }}
                </li>
              </ul>
            </UCard>
            <UCard>
              <h3 class="font-semibold mb-3">Permission Required</h3>
              <ul class="space-y-2">
                <li
                  v-for="item in permissionRequired"
                  :key="item"
                  class="flex items-center gap-2 text-sm text-muted"
                >
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="size-4 text-warning"
                  />
                  {{ item }}
                </li>
              </ul>
            </UCard>
          </div>
        </div>
      </section>

      <!-- Quick Reference -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Quick Reference</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard class="border-success/50">
            <h3 class="font-semibold mb-3 text-success">What You CAN Say</h3>
            <ul class="space-y-2">
              <li
                v-for="item in canSay"
                :key="item"
                class="flex items-start gap-2 text-sm"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="size-4 text-success shrink-0 mt-0.5"
                />
                {{ item }}
              </li>
            </ul>
          </UCard>
          <UCard class="border-error/50">
            <h3 class="font-semibold mb-3 text-error">
              What You CANNOT Say (without authorization)
            </h3>
            <ul class="space-y-2">
              <li
                v-for="item in cannotSay"
                :key="item"
                class="flex items-start gap-2 text-sm"
              >
                <UIcon
                  name="i-heroicons-x-circle"
                  class="size-4 text-error shrink-0 mt-0.5"
                />
                {{ item }}
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Contact -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Questions?</h2>
        <UCard>
          <div class="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="font-medium mb-1">Branding Questions</p>
              <p class="text-muted">branding@openecualliance.org</p>
            </div>
            <div>
              <p class="font-medium mb-1">Compliance Questions</p>
              <NuxtLink
                to="/docs/compliance"
                class="text-primary hover:underline"
              >
                See Compliance Docs
              </NuxtLink>
            </div>
            <div>
              <p class="font-medium mb-1">Trademark Concerns</p>
              <p class="text-muted">legal@openecualliance.org</p>
            </div>
          </div>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton to="/docs/compliance" icon="i-heroicons-check-badge" size="lg">
          Compliance Levels
        </UButton>
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/BRANDING.md"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="outline"
          size="lg"
        >
          View on GitHub
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
