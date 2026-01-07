<script setup lang="ts">
  useSeoMeta({
    title: 'Governance - OpenECU Alliance',
    description: 'How the OpenECU Alliance operates, makes decisions, and evolves the specification.',
  });

  const principles = [
    {
      title: 'Openness',
      description: 'All specifications are freely available. Development happens in the open.',
      icon: 'i-heroicons-globe-alt',
    },
    {
      title: 'Consensus',
      description: 'Major decisions are made through community discussion and rough consensus.',
      icon: 'i-heroicons-users',
    },
    {
      title: 'Meritocracy',
      description: 'Influence is earned through contribution and demonstrated expertise.',
      icon: 'i-heroicons-academic-cap',
    },
    {
      title: 'Vendor Neutrality',
      description: 'The spec serves the community, not any single vendor or product.',
      icon: 'i-heroicons-scale',
    },
    {
      title: 'Pragmatism',
      description: 'Working code and real-world usage inform specification design.',
      icon: 'i-heroicons-wrench-screwdriver',
    },
  ];

  const roles = [
    {
      name: 'Steering Committee',
      description:
        'Provides strategic direction for the Alliance. Approves major spec versions, accepts donated projects, resolves disputes, and manages trademarks.',
      composition: '3-7 members with staggered 2-year terms',
      icon: 'i-heroicons-building-office',
    },
    {
      name: 'Maintainers',
      description:
        'Have write access to Alliance repositories. Review and merge PRs, triage issues, ensure quality, and mentor new contributors.',
      composition: 'Nominated by existing Maintainers, approved by Steering Committee',
      icon: 'i-heroicons-code-bracket',
    },
    {
      name: 'Contributors',
      description:
        'Anyone who contributes through submitting adapters, proposing changes, reporting bugs, improving docs, or participating in discussions.',
      composition: 'Open to all',
      icon: 'i-heroicons-user-group',
    },
  ];

  const workingGroups = [
    {
      name: 'Adapter Working Group',
      focus: 'Reviews adapter submissions, maintains quality standards',
    },
    {
      name: 'Spec Evolution Working Group',
      focus: 'Develops and reviews RFCs for specification changes',
    },
    {
      name: 'Tooling Working Group',
      focus: 'Develops validation tools, SDKs, and reference implementations',
    },
  ];

  const reviewPeriods = [
    { type: 'Adapter additions', period: '7 days' },
    { type: 'Minor spec changes', period: '14 days' },
    { type: 'Major spec changes', period: '30 days' },
  ];

  const votingTypes = [
    {
      type: 'Simple Majority',
      use: 'Routine decisions, adapter disputes',
    },
    {
      type: 'Supermajority (2/3)',
      use: 'Specification changes, governance changes',
    },
    {
      type: 'Unanimous',
      use: 'Removing a Steering Committee member',
    },
  ];

  const rfcSteps = [
    {
      step: 'Draft',
      description: 'Author creates RFC document in rfcs/ directory',
    },
    {
      step: 'Discussion',
      description: 'Community provides feedback via PR comments',
    },
    { step: 'Revision', description: 'Author incorporates feedback' },
    {
      step: 'FCP',
      description: 'Final Comment Period (14 days) for last objections',
    },
    { step: 'Decision', description: 'Steering Committee accepts or rejects' },
    {
      step: 'Implementation',
      description: 'Changes incorporated into specification',
    },
  ];

  const enforcementLevels = [
    { level: 'Warning', description: 'First violation, unless severe' },
    { level: 'Temporary Ban', description: 'Repeated violations, 30-90 days' },
    { level: 'Permanent Ban', description: 'Severe or continued violations' },
  ];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink to="/docs" class="text-sm text-muted hover:text-primary inline-flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <UBadge color="primary" variant="subtle" class="mb-4"> Version 1.0.0 </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Governance</h1>
        <p class="text-lg text-muted">
          How the OpenECU Alliance operates, makes decisions, and evolves the specification.
        </p>
      </div>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Overview</h2>
        <UCard>
          <p class="text-muted">
            The OpenECU Alliance is an open community dedicated to standardizing ECU log data formats and building an
            ecosystem of interoperable automotive tools. The Alliance maintains the OpenECU Spec and coordinates
            development of Alliance Projects.
          </p>
        </UCard>
      </section>

      <!-- Guiding Principles -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Guiding Principles</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard v-for="principle in principles" :key="principle.title">
            <div class="flex items-start gap-3">
              <div class="bg-primary/10 p-2 rounded-lg shrink-0">
                <UIcon :name="principle.icon" class="size-5 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold mb-1">{{ principle.title }}</h3>
                <p class="text-sm text-muted">{{ principle.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Organizational Structure -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Organizational Structure</h2>

        <h3 class="text-xl font-semibold mb-4">Roles</h3>
        <div class="space-y-4 mb-8">
          <UCard v-for="role in roles" :key="role.name">
            <div class="flex items-start gap-4">
              <div class="flex items-center justify-center size-12 bg-primary/10 text-primary rounded-xl shrink-0">
                <UIcon :name="role.icon" class="size-6" />
              </div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold mb-2">{{ role.name }}</h4>
                <p class="text-muted mb-2">{{ role.description }}</p>
                <p class="text-sm">
                  <span class="font-medium">Composition:</span>
                  {{ role.composition }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <h3 class="text-xl font-semibold mb-4">Working Groups</h3>
        <UCard>
          <p class="text-muted mb-4">
            Working Groups may be formed for specific focus areas and are created by Steering Committee approval.
          </p>
          <div class="space-y-3">
            <div v-for="group in workingGroups" :key="group.name" class="flex items-start gap-2">
              <UIcon name="i-heroicons-user-group" class="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span class="font-medium">{{ group.name }}</span>
                <span class="text-muted"> - {{ group.focus }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Decision Making -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Decision Making</h2>

        <div class="space-y-6">
          <!-- Consensus Model -->
          <UCard>
            <h3 class="font-semibold mb-3">Lazy Consensus Model</h3>
            <p class="text-muted mb-4">The Alliance uses a lazy consensus model for most decisions:</p>
            <ol class="list-decimal list-inside space-y-2 text-sm text-muted mb-4">
              <li>A proposal is made (PR, RFC, or discussion)</li>
              <li>Community members discuss and provide feedback</li>
              <li>If no objections after the review period, the proposal is accepted</li>
              <li>If objections exist, discussion continues until consensus is reached</li>
            </ol>
            <div class="bg-muted/30 p-4 rounded-lg">
              <p class="text-sm font-medium mb-2">Review Periods:</p>
              <div class="grid grid-cols-3 gap-2 text-sm">
                <div v-for="period in reviewPeriods" :key="period.type" class="text-center">
                  <div class="font-medium">{{ period.period }}</div>
                  <div class="text-muted text-sm">{{ period.type }}</div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Voting -->
          <UCard>
            <h3 class="font-semibold mb-3">Voting</h3>
            <p class="text-muted mb-4">
              When consensus cannot be reached, decisions may go to a vote. Only Maintainers and Steering Committee
              members may vote on formal matters.
            </p>
            <div class="space-y-2">
              <div v-for="vote in votingTypes" :key="vote.type" class="flex items-start gap-2 text-sm">
                <UBadge color="neutral" variant="subtle" size="md">
                  {{ vote.type }}
                </UBadge>
                <span class="text-muted">{{ vote.use }}</span>
              </div>
            </div>
          </UCard>

          <!-- RFC Process -->
          <UCard>
            <h3 class="font-semibold mb-3">RFC Process</h3>
            <p class="text-muted mb-4">
              Significant changes to the specification follow the RFC (Request for Comments) process:
            </p>
            <div class="space-y-3">
              <div v-for="(step, index) in rfcSteps" :key="step.step" class="flex items-start gap-3">
                <div
                  class="flex items-center justify-center size-6 bg-primary/10 text-primary rounded-full text-sm font-bold shrink-0"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <span class="font-medium">{{ step.step }}</span>
                  <span class="text-muted text-sm"> - {{ step.description }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Specification Versioning -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Specification Versioning</h2>
        <UCard>
          <p class="text-muted mb-4">
            The OpenECU Spec follows
            <a href="https://semver.org/" target="_blank" class="text-primary hover:underline">Semantic Versioning</a>:
          </p>
          <div class="grid sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-error/10 p-3 rounded-lg">
              <p class="font-bold text-error">MAJOR (X.0.0)</p>
              <p class="text-sm text-muted">Breaking changes that require adapter updates</p>
            </div>
            <div class="bg-warning/10 p-3 rounded-lg">
              <p class="font-bold text-warning">MINOR (0.X.0)</p>
              <p class="text-sm text-muted">New features, backward-compatible additions</p>
            </div>
            <div class="bg-success/10 p-3 rounded-lg">
              <p class="font-bold text-success">PATCH (0.0.X)</p>
              <p class="text-sm text-muted">Clarifications, typo fixes, no functional changes</p>
            </div>
          </div>

          <h4 class="font-semibold mb-2">Deprecation Policy</h4>
          <p class="text-sm text-muted">
            Features may be deprecated with at least one minor version of warning. Warning period of at least 6 months
            before removal in next major version.
          </p>
        </UCard>
      </section>

      <!-- Adapter Governance -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Adapter Governance</h2>
        <div class="space-y-4">
          <UCard>
            <h3 class="font-semibold mb-3">Adapter Submission</h3>
            <ol class="list-decimal list-inside space-y-2 text-sm text-muted">
              <li>Create adapter following SPECIFICATION.md</li>
              <li>Validate against JSON Schema</li>
              <li>Submit Pull Request</li>
              <li>Adapter Working Group reviews</li>
              <li>Community review period (7 days)</li>
              <li>Merged if approved</li>
            </ol>
          </UCard>

          <UCard>
            <h3 class="font-semibold mb-3">Adapter Ownership</h3>
            <p class="text-muted mb-3">
              Adapters in this repository are owned by the Alliance, not individual contributors. This ensures:
            </p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Long-term maintenance regardless of original author availability
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Consistent quality standards
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Freedom for any Maintainer to update
              </li>
            </ul>
            <p class="text-sm text-muted mt-3">Original authors are credited in adapter metadata.</p>
          </UCard>
        </div>
      </section>

      <!-- Code of Conduct -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Code of Conduct</h2>
        <UCard>
          <p class="text-muted mb-4">
            All participants must adhere to the Code of Conduct. Enforcement decisions are made by the Steering
            Committee.
          </p>
          <h4 class="font-semibold mb-2">Enforcement Levels:</h4>
          <div class="space-y-2">
            <div v-for="level in enforcementLevels" :key="level.level" class="flex items-center gap-3 text-sm">
              <UBadge
                :color="level.level === 'Warning' ? 'warning' : level.level === 'Temporary Ban' ? 'error' : 'neutral'"
                variant="subtle"
                size="md"
              >
                {{ level.level }}
              </UBadge>
              <span class="text-muted">{{ level.description }}</span>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Amendments -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Amendments</h2>
        <UCard>
          <p class="text-muted">
            This governance document may be amended through the RFC process with a supermajority vote of the Steering
            Committee.
          </p>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton to="/contribute" icon="i-heroicons-hand-raised" size="lg"> Get Involved </UButton>
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/GOVERNANCE.md"
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
