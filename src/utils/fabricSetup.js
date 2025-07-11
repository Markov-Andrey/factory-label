import * as fabric from 'fabric';

/**
 * Добавляет глобальную поддержку кастомного свойства `id`
 * в fabric.Object и его сериализацию через toObject().
 * Вызывать один раз при инициализации приложения.
 */
export function initFabricGlobalProps() {
    if (!fabric.Object.prototype._idPropsAdded) {
        if (!fabric.Object.prototype.stateProperties) {
            fabric.Object.prototype.stateProperties = [];
        }

        if (!fabric.Object.prototype.stateProperties.includes('id')) {
            fabric.Object.prototype.stateProperties.push('id');
        }

        if (!fabric.Object.prototype.stateProperties.includes('meta')) {
            fabric.Object.prototype.stateProperties.push('meta');
        }

        const originalToObject = fabric.Object.prototype.toObject;
        fabric.Object.prototype.toObject = function(propertiesToInclude) {
            const obj = originalToObject.call(this, propertiesToInclude);
            if (this.id) obj.id = this.id;
            if (this.meta) obj.meta = this.meta;
            return obj;
        };

        fabric.Object.prototype._idPropsAdded = true;
    }
}
