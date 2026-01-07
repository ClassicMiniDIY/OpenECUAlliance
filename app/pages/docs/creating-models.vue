<script setup lang="ts">
  useSeoMeta({
    title: 'Submitting 3D Models - OpenECU Alliance',
    description: 'Guide to submitting 3D printable ECU mounts, enclosures, and accessories to the OpenECU Alliance.',
  });

  const categories = [
    {
      name: 'Mounts',
      description: 'ECU mounting brackets for firewall, bulkhead, or console',
      icon: 'i-heroicons-cube',
    },
    {
      name: 'Enclosures',
      description: 'Protective cases and weatherproof housings',
      icon: 'i-heroicons-inbox',
    },
    {
      name: 'Brackets',
      description: 'Sensor mounts, connector holders, cable management',
      icon: 'i-heroicons-wrench',
    },
    {
      name: 'Adapters',
      description: 'Physical connector adapters and spacers',
      icon: 'i-heroicons-link',
    },
    {
      name: 'Accessories',
      description: 'Labels, covers, cable clips, and misc items',
      icon: 'i-heroicons-cog-6-tooth',
    },
  ];

  const materials = [
    {
      name: 'PETG',
      rating: 'Recommended',
      color: 'success',
      notes: 'Good heat resistance, easy to print, durable',
    },
    {
      name: 'ASA',
      rating: 'Excellent',
      color: 'success',
      notes: 'UV resistant, heat resistant, outdoor suitable',
    },
    {
      name: 'ABS',
      rating: 'Good',
      color: 'warning',
      notes: 'Heat resistant but requires enclosure to print',
    },
    {
      name: 'Nylon',
      rating: 'Excellent',
      color: 'success',
      notes: 'Very strong, heat resistant, requires dry box',
    },
    {
      name: 'PLA',
      rating: 'Not Recommended',
      color: 'error',
      notes: 'Low heat resistance - will deform in engine bay',
    },
  ];

  const supportedFormats = [
    { format: 'STL', required: true, description: 'Print-ready mesh file' },
    {
      format: 'STEP',
      required: false,
      description: 'CAD source for modifications',
    },
    {
      format: '3MF',
      required: false,
      description: 'With embedded print settings',
    },
    { format: 'OBJ', required: false, description: 'Alternative mesh format' },
    {
      format: 'F3D/F3Z',
      required: false,
      description: 'Fusion 360 source files',
    },
  ];

  const uploadSteps = [
    {
      step: 1,
      title: 'Create an Account',
      description: 'Sign up with Google, Apple, or email to start contributing.',
    },
    {
      step: 2,
      title: 'Start Upload',
      description: 'Navigate to Models → Upload Model to begin the submission wizard.',
    },
    {
      step: 3,
      title: 'Add Files',
      description:
        'Upload your STL and optional STEP/3MF files. We recommend including source files for modifications.',
    },
    {
      step: 4,
      title: 'Add Images',
      description: 'Upload renders, photos of your prints, and installation shots. A primary image is required.',
    },
    {
      step: 5,
      title: 'Fill in Details',
      description: 'Provide print settings, hardware requirements, and assembly instructions.',
    },
    {
      step: 6,
      title: 'Submit for Review',
      description: "Submit your model for moderator review. You'll be notified when it's approved.",
    },
  ];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink to="/docs" class="text-sm text-muted hover:text-warning inline-flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <UBadge color="warning" variant="subtle">3D Model</UBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Submitting 3D Models</h1>
        <p class="text-lg text-muted">
          Share your 3D printable ECU mounts, enclosures, and accessories with the community.
        </p>
      </div>

      <!-- Quick Start CTA -->
      <UCard class="mb-12 bg-warning/5 border-warning/20">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="bg-warning/10 p-3 rounded-xl shrink-0">
            <UIcon name="i-heroicons-arrow-up-tray" class="size-8 text-warning" />
          </div>
          <div class="flex-1">
            <h2 class="font-semibold text-lg mb-1">Ready to share your design?</h2>
            <p class="text-muted text-sm">
              Upload your 3D models directly through our website. No GitHub account required.
            </p>
          </div>
          <UButton to="/models/upload" color="warning" size="lg"> Upload Model </UButton>
        </div>
      </UCard>

      <!-- Categories -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Model Categories</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard v-for="cat in categories" :key="cat.name">
            <div class="flex items-start gap-3">
              <div class="bg-warning/10 p-2 rounded-lg shrink-0">
                <UIcon :name="cat.icon" class="size-5 text-warning" />
              </div>
              <div>
                <h3 class="font-semibold">{{ cat.name }}</h3>
                <p class="text-sm text-muted">{{ cat.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Before You Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Before You Start</h2>
        <UCard>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div><strong>Design for printability</strong> - Consider overhangs, supports, and bed adhesion.</div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Test print your design</strong> - Verify fitment and structural integrity before submitting.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Take photos</strong> - Document your prints, especially installed photos. These help others see
                the real result.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <strong>Include source files</strong> - Provide STEP files so others can modify for their needs.
              </div>
            </li>
          </ul>
        </UCard>
      </section>

      <!-- How to Submit -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">How to Submit</h2>
        <div class="space-y-4">
          <UCard v-for="item in uploadSteps" :key="item.step">
            <div class="flex items-start gap-4">
              <div
                class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
              >
                {{ item.step }}
              </div>
              <div>
                <h3 class="font-semibold mb-1">{{ item.title }}</h3>
                <p class="text-sm text-muted">{{ item.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Material Guide -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Material Guide for Engine Bay</h2>
        <UCard>
          <p class="text-muted mb-4">
            Engine bays can reach high temperatures. Choose materials appropriate for your application.
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Material</th>
                  <th class="text-left py-2 pr-4 font-semibold">Rating</th>
                  <th class="text-left py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mat in materials" :key="mat.name" class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">{{ mat.name }}</td>
                  <td class="py-2 pr-4">
                    <UBadge :color="mat.color" variant="subtle" size="sm">
                      {{ mat.rating }}
                    </UBadge>
                  </td>
                  <td class="py-2 text-muted">{{ mat.notes }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Supported File Formats -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Supported File Formats</h2>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Format</th>
                  <th class="text-left py-2 pr-4 font-semibold">Required</th>
                  <th class="text-left py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="fmt in supportedFormats" :key="fmt.format" class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">{{ fmt.format }}</td>
                  <td class="py-2 pr-4">
                    <UBadge :color="fmt.required ? 'success' : 'neutral'" variant="subtle" size="sm">
                      {{ fmt.required ? 'Required' : 'Optional' }}
                    </UBadge>
                  </td>
                  <td class="py-2 text-muted">{{ fmt.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-muted mt-4">Maximum file size: 50MB per file, 200MB total per model.</p>
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
              STL file is watertight (no holes in mesh)
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              You've successfully printed and tested the model
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Print settings are accurate and tested
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Hardware list is complete and accurate
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Assembly instructions are clear
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Photos show the print quality clearly
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              License selection is appropriate (CC-BY-SA recommended)
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Moderation Process -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Moderation Process</h2>
        <UCard>
          <p class="text-muted mb-4">
            All submissions are reviewed by moderators before being published. This helps maintain quality and ensures
            designs are safe and functional.
          </p>
          <div class="grid sm:grid-cols-3 gap-4">
            <div class="text-center p-4">
              <div class="size-12 mx-auto mb-2 rounded-full bg-warning/10 flex items-center justify-center">
                <UIcon name="i-heroicons-clock" class="size-6 text-warning" />
              </div>
              <p class="font-medium">Pending</p>
              <p class="text-xs text-muted">Awaiting review</p>
            </div>
            <div class="text-center p-4">
              <div class="size-12 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
                <UIcon name="i-heroicons-check" class="size-6 text-success" />
              </div>
              <p class="font-medium">Approved</p>
              <p class="text-xs text-muted">Published to the community</p>
            </div>
            <div class="text-center p-4">
              <div class="size-12 mx-auto mb-2 rounded-full bg-error/10 flex items-center justify-center">
                <UIcon name="i-heroicons-x-mark" class="size-6 text-error" />
              </div>
              <p class="font-medium">Rejected</p>
              <p class="text-xs text-muted">Feedback provided</p>
            </div>
          </div>
          <p class="text-sm text-muted mt-4">
            You can preview your submission while it's pending and make edits if needed.
          </p>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton to="/models/upload" icon="i-heroicons-arrow-up-tray" color="warning" size="lg">
          Upload Your Model
        </UButton>
        <UButton to="/models" color="neutral" variant="outline" icon="i-heroicons-cube" size="lg">
          Browse Models
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
