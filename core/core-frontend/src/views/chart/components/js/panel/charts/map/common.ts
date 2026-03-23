import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const MAP_EDITOR_PROPERTY: EditorProperty[] = [
  'background-overall-component',
  'border-style',
  'basic-style-selector',
  'title-selector',
  'label-selector',
  'tooltip-selector',
  'function-cfg',
  'map-mapping',
  'jump-set',
  'linkage'
]

export const MAP_EDITOR_PROPERTY_INNER: EditorPropertyInner = {
  'background-overall-component': ['all'],
  'border-style': ['all'],
  'basic-style-selector': ['colors', 'alpha', 'areaBorderColor', 'zoom'],
  'title-selector': [
    'title',
    'fontSize',
    'color',
    'hPosition',
    'isItalic',
    'isBolder',
    'remarkShow',
    'fontFamily',
    'letterSpace',
    'fontShadow'
  ],
  'label-selector': [
    'color',
    'fontSize',
    'labelBgColor',
    'labelShadow',
    'labelShadowColor',
    'showDimension',
    'showQuota'
  ],
  'tooltip-selector': ['color', 'fontSize', 'backgroundColor', 'seriesTooltipFormatter', 'show'],
  'function-cfg': ['emptyDataStrategy'],
  'map-mapping': ['']
}

export const MAP_AXIS_TYPE: AxisType[] = [
  'xAxis',
  'yAxis',
  'area',
  'drill',
  'filter',
  'extLabel',
  'extTooltip'
]

export const osmMapStyleOptions = [
  { name: t('chart.map_style_normal'), value: 'normal' },
  { name: t('commons.custom'), value: 'custom' }
]

// Keep legacy exports for backward compatibility
export const gaodeMapStyleOptions = osmMapStyleOptions
export const tdtMapStyleOptions = osmMapStyleOptions
export const qqMapStyleOptions = osmMapStyleOptions

export declare type MapMouseEvent = MouseEvent & {
  feature: GeoJSON.Feature
}
