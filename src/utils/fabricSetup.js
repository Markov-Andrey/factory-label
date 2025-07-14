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

        const customProps = ['id', 'meta', 'meta_type'];

        customProps.forEach(prop => {
            if (!fabric.Object.prototype.stateProperties.includes(prop)) {
                fabric.Object.prototype.stateProperties.push(prop);
            }
        });

        const originalToObject = fabric.Object.prototype.toObject;
        fabric.Object.prototype.toObject = function(propertiesToInclude) {
            const obj = originalToObject.call(this, propertiesToInclude);
            customProps.forEach(prop => {
                if (this[prop] !== undefined) {
                    obj[prop] = this[prop];
                }
            });
            return obj;
        };

        fabric.Object.prototype._idPropsAdded = true;
    }
}
