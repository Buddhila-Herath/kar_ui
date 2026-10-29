import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Icons from '../../utils/icons';

const FieldSelectionDropdown = ({
    fields = [],
    visibleFields = {},
    onFieldToggle,
    onSelectAll,
    selectAllChecked,
    buttonText = "All Fields",
    containerStyle = {},
    isOpen,
    onOpenChange,
    className, // optional class for outer container
    menuClassName, // optional class for dropdown panel
    lockWhenSelectAllUncheckedIds = [], // lock these only when Select All is unchecked
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const scrollPosRef = useRef(0);
    const [menuStyle, setMenuStyle] = useState({ top: 0, right: 0, minWidth: 212, maxHeight: 420, useBottom: false, bottom: undefined });

    const isControlled = typeof isOpen === 'boolean';
    const open = isControlled ? isOpen : uncontrolledOpen;
    const setOpen = (v) => {
        if (isControlled) {
            onOpenChange && onOpenChange(v);
        } else {
            setUncontrolledOpen(v);
        }
    };

    // Robust Chrome detection across platforms (desktop, Android, iOS)
    // - Uses UA-CH (navigator.userAgentData) when available
    // - Recognizes iOS Chrome via "CriOS"
    // - Excludes common Chromium variants (Edge, Opera, Samsung, etc.)
    const getIsChrome = () => {
        if (typeof navigator === 'undefined') return false;
        const ua = navigator.userAgent || '';

        // iOS Chrome identifies as Safari but includes "CriOS/x"
        if (/CriOS\/\d+/.test(ua)) return true;

        // User-Agent Client Hints (more reliable on modern Chrome)
        const uaData = navigator.userAgentData;
        if (uaData && Array.isArray(uaData.brands)) {
            const brands = uaData.brands.map(b => (b && b.brand) ? b.brand : '');
            const hasGoogleChrome = brands.some(b => /Google Chrome/i.test(b));
            const hasEdge = brands.some(b => /Microsoft Edge/i.test(b));
            const hasOpera = brands.some(b => /Opera/i.test(b));
            if (hasGoogleChrome && !hasEdge && !hasOpera) return true;
        }

        // Fallback to UA tokens (desktop/Android)
        const isChromeToken = /Chrome\/\d+/.test(ua);
        const isExcluded = /(Edg|EdgA|OPR|SamsungBrowser|UCBrowser|Whale|YaBrowser|Vivaldi|Brave|DuckDuckGo|MiuiBrowser|Puffin|QQBrowser|Baidu|LBBROWSER|Sogou|MetaSr)\//.test(ua);
        return isChromeToken && !isExcluded;
    };

    const isChrome = getIsChrome();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownRef.current, isControlled, onOpenChange]);

    const updateMenuPosition = () => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const GAP = 6; 
        const MIN_WIDTH = 212; 

        const spaceBelow = window.innerHeight - rect.bottom - GAP;
        const spaceAbove = rect.top - GAP;

        let useBottom = false;
        let top = rect.bottom + GAP;
        let bottom;
        if (spaceBelow < 300 && spaceAbove > spaceBelow) {
            useBottom = true;
            bottom = window.innerHeight - rect.top + GAP;
        }

        const maxHeight = Math.max(180, Math.min(420, useBottom ? spaceAbove : spaceBelow));

        // Align the dropdown's right edge to the button's right edge
        const right = Math.max(0, window.innerWidth - rect.right);

        setMenuStyle({ top, useBottom, bottom, maxHeight, right, minWidth: MIN_WIDTH });
    };

    useLayoutEffect(() => {
        if (!open) return;
        updateMenuPosition();

        const onScrollOrResize = () => updateMenuPosition();
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [open]);

    const computedAllSelected = fields.every(field => visibleFields[field.id]);
    const isAllSelected = typeof selectAllChecked === 'boolean' ? selectAllChecked : computedAllSelected;

    const handleSelectAll = (e) => {
        e.stopPropagation();
        if (onSelectAll) {
            // Pass the desired checked state to parent so it can
            // choose between selecting all or restoring defaults.
            onSelectAll(e.target.checked);
        }
    };

    const handleFieldToggle = (fieldId, e) => {
        if (e) e.stopPropagation();
        // Lock only when Select All is explicitly unchecked
        if (selectAllChecked === false && lockWhenSelectAllUncheckedIds.includes(fieldId)) {
            return;
        }
        if (onFieldToggle) {
            onFieldToggle(fieldId);
        }
    };

    return (
        <div
            className={["field-selection-container", className].filter(Boolean).join(' ')}
            style={containerStyle}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="field-dropdown-wrapper" ref={dropdownRef}>
                <button
                    className="field-dropdown-button"
                    onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                    aria-label="Customize Table"
                    ref={buttonRef}
                    id="customize-table-btn"
                >
                    <img src={Icons.plus} alt="add fields" className="icon-plus" />

                </button>
                {!open && (
                    <div className="field-tooltip">
                        <span className="field-tooltip-arrow" />
                        <span>Customize Table</span>
                    </div>
                )}

                {open && createPortal(
                    (
                        <div
                            className={["field-dropdown-menu", isChrome && 'chromescreen', menuClassName].filter(Boolean).join(' ')}
                            style={{
                                position: 'fixed',
                                top: menuStyle.useBottom ? undefined : `${menuStyle.top}px`,
                                bottom: menuStyle.useBottom ? `${menuStyle.bottom}px` : undefined,
                                left: 'auto',
                                right: `${menuStyle.right}px`,
                                minWidth: `${menuStyle.minWidth}px`,
                                maxHeight: `${menuStyle.maxHeight}px`,
                                zIndex: 2000,
                                overscrollBehavior: 'contain',
                                overflow: 'hidden',
                            }}
                            ref={menuRef}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                        >
                            <div
                                className="menu-scroll"
                                style={{ maxHeight: menuStyle.maxHeight - 32, overflowY: 'auto' }}
                                onScroll={(e) => { scrollPosRef.current = e.currentTarget.scrollTop; }}
                            >
                                <div className="select-all-row">
                                    <label>
                                        All Fields
                                    </label>
                                </div>
                                <div className="option-row">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            id="select-all-checkbox"
                                        />
                                        Select All
                                    </label>
                                </div>
                                <div className="options">
                                    {fields.map((field) => {
                                        const isLocked = lockWhenSelectAllUncheckedIds.includes(field.id);
                                        return (
                                            <div key={field.id} className="option-row">
                                                <label className={isLocked ? 'disabled' : ''}>
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleFields[field.id]}
                                                        onChange={(e) => handleFieldToggle(field.id, e)}
                                                        disabled={isLocked}
                                                        id={`${field.id}-checkbox`}
                                                    />
                                                    <span className="option-label">{field.name}</span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ),
                    document.body
                )}
            </div>
        </div>
    );
};

export default FieldSelectionDropdown;
